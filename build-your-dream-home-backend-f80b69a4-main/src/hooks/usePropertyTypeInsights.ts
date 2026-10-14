import { useCallback, useEffect, useMemo, useState } from "react";
import { TYPES } from "@/data/propertyTypes";
import type { TypeKey } from "@/data/propertyTypes";
import {
  buildMarketSnapshot,
  countTypeInterests,
  recordTypeInterest,
  topInterestedType,
} from "@/lib/propertyTypeInsights";
import type { InterestKind, MarketSnapshot, TypeMetrics } from "@/lib/propertyTypeInsights";

/**
 * usePropertyTypeInsights
 *
 * Combines the three layers of the dynamic property-type system:
 *  1. Live metrics — prefers `/api/property-types` (48h rotation, CDN-cacheable);
 *     falls back to the identical client-side computation if the API is
 *     unreachable, and finally to the static dataset.
 *  2. Rotation — recomputes automatically when the 48h slot boundary passes
 *     while the page is open.
 *  3. Personalization — weighted interest events (view 1 / click 3 /
 *     consult 6) from localStorage, exposed as counts + a smart order that
 *     puts the most-interested type first while preserving the compare ladder.
 */

interface LiveTypeData {
  metrics: TypeMetrics;
  prev: TypeMetrics | null;
}

interface InsightsState {
  bySlug: Record<string, LiveTypeData>;
  generatedAt: number | null;
  nextRotationAt: number | null;
  source: "api" | "local" | "static";
}

function staticFallback(): Record<string, LiveTypeData> {
  const out: Record<string, LiveTypeData> = {};
  for (const t of TYPES) {
    out[t.slug] = {
      metrics: { startingPrice: t.startingPrice, rentYield: t.rentYield, liquidity: t.liquidity },
      prev: null,
    };
  }
  return out;
}

export function usePropertyTypeInsights() {
  const [state, setState] = useState<InsightsState>(() => ({
    bySlug: staticFallback(),
    generatedAt: null,
    nextRotationAt: null,
    source: "static",
  }));

  const [interestVersion, setInterestVersion] = useState(0);
  const bumpInterest = useCallback(() => setInterestVersion((v) => v + 1), []);

  // Cross-tab personalization sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key === "byh:type-interest") bumpInterest();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [bumpInterest]);

  useEffect(() => {
    let cancelled = false;

    // Instant local snapshot so the table is dynamic even before/without the API.
    const local: MarketSnapshot = buildMarketSnapshot();
    setState((s) => ({
      ...s,
      bySlug: Object.fromEntries(
        Object.entries(local.types).map(([slug, v]) => [slug, { metrics: v.metrics, prev: v.prev }]),
      ),
      generatedAt: local.generatedAt,
      nextRotationAt: local.nextRotationAt,
      source: "local",
    }));

    const top = topInterestedType();
    const url = `/api/property-types${top ? `?user_preference=${encodeURIComponent(top)}` : ""}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((payload: { data: Record<string, { metrics?: unknown; prev?: unknown }> & Record<string, unknown>; meta?: { generatedAt?: number; nextRotationAt?: number } }) => {
        if (cancelled) return;
        const bySlug: Record<string, LiveTypeData> = {};
        for (const t of TYPES) {
          const entry = payload.data?.[t.slug] as
            | { startingPrice?: number; rentYield?: number; liquidity?: TypeMetrics["liquidity"]; prev?: { startingPrice?: number; rentYield?: number; liquidity?: TypeMetrics["liquidity"] } | null }
            | undefined;
          if (!entry || typeof entry.startingPrice !== "number" || typeof entry.rentYield !== "number") continue;
          bySlug[t.slug] = {
            metrics: {
              startingPrice: entry.startingPrice,
              rentYield: entry.rentYield,
              liquidity: entry.liquidity ?? "Medium",
            },
            prev:
              entry.prev && typeof entry.prev.startingPrice === "number"
                ? {
                    startingPrice: entry.prev.startingPrice,
                    rentYield: entry.prev.rentYield ?? entry.rentYield,
                    liquidity: entry.prev.liquidity ?? "Medium",
                  }
                : null,
          };
        }
        if (Object.keys(bySlug).length === 0) return;
        setState((s) => ({
          ...s,
          bySlug,
          generatedAt: payload.meta?.generatedAt ?? s.generatedAt,
          nextRotationAt: payload.meta?.nextRotationAt ?? s.nextRotationAt,
          source: "api",
        }));
      })
      .catch(() => {
        /* keep local snapshot */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-rotate when the 48h boundary passes while the page stays open.
  useEffect(() => {
    if (!state.nextRotationAt) return;
    const delay = Math.max(0, Math.min(state.nextRotationAt - Date.now(), 2_147_000_000));
    const id = window.setTimeout(() => {
      const next = buildMarketSnapshot();
      setState((s) => ({
        ...s,
        bySlug: Object.fromEntries(
          Object.entries(next.types).map(([slug, v]) => [slug, { metrics: v.metrics, prev: v.prev }]),
        ),
        generatedAt: next.generatedAt,
        nextRotationAt: next.nextRotationAt,
        source: s.source === "api" ? "local" : s.source,
      }));
      fetch("/api/property-types")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }, delay);
    return () => window.clearTimeout(id);
  }, [state.nextRotationAt]);

  const counts = useMemo(() => {
    void interestVersion;
    return countTypeInterests();
  }, [interestVersion]);

  const topType = useMemo(() => {
    void interestVersion;
    return topInterestedType();
  }, [interestVersion]);

  const recordInterest = useCallback(
    (slug: TypeKey, kind: InterestKind = "click") => {
      recordTypeInterest(slug, kind);
      bumpInterest();
    },
    [bumpInterest],
  );

  /** Interested type first, original (price-tier) order preserved below it. */
  const order = useMemo(() => {
    const base = TYPES.map((t) => t.slug);
    return topType ? [topType, ...base.filter((s) => s !== topType)] : base;
  }, [topType]);

  return { bySlug: state.bySlug, generatedAt: state.generatedAt, nextRotationAt: state.nextRotationAt, source: state.source, counts, topType, order, recordInterest };
}
