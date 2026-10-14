import { TYPES } from "@/data/propertyTypes";
import type { TypeKey } from "@/data/propertyTypes";

/**
 * Property-type market engine + behavioral interest tracking.
 *
 * A. Dynamic rotation: every 48 hours a deterministic pseudo-random walk
 *    (seeded from the UTC epoch slot) produces new "market" values for the
 *    6 core residential types — starting price, rent yield and liquidity —
 *    simulating real-estate fluctuations without a backend database.
 *    The previous slot's values are kept so the UI can show the change
 *    across the last 2-day span.
 *
 *    A real cron can hit `/api/property-types?refresh=1` (or any caller can
 *    simply load the endpoint) to pre-compute and cache the same values;
 *    the client function is pure, so both sides always agree.
 *
 * B. Personalization: interest events (clicks, views, consultation intents)
 *    are stored in localStorage and drive smart reordering + highlighting.
 */

export const ROTATION_INTERVAL_MS = 48 * 60 * 60 * 1000; // 48 hours

/** Bounded deterministic market fluctuation per 48h slot. */
export const PRICE_DRIFT_MAX = 0.035; // ±3.5%
export const YIELD_DRIFT_MAX = 0.4; // ±0.4 percentage points

export type Liquidity = "High" | "Medium" | "Low";

export interface TypeMetrics {
  startingPrice: number; // EGP
  rentYield: number; // % (one decimal)
  liquidity: Liquidity;
}

export interface MarketSnapshot {
  generatedAt: number; // epoch ms of the slot boundary
  nextRotationAt: number; // epoch ms when the next slot begins
  types: Record<TypeKey, { metrics: TypeMetrics; prev: TypeMetrics | null }>;
}

/* ------------------------------------------------------------------ */
/* Deterministic 48-hour market rotation                              */
/* ------------------------------------------------------------------ */

function hash32(n: number): number {
  // xmurm3-ish integer hash — fast, deterministic, no deps.
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Seeded PRNG (mulberry32) — same seed always yields the same walk. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function currentSlot(now: number = Date.now()) {
  return Math.floor(now / ROTATION_INTERVAL_MS);
}

export function slotBoundary(slot: number) {
  return {
    generatedAt: slot * ROTATION_INTERVAL_MS,
    nextRotationAt: (slot + 1) * ROTATION_INTERVAL_MS,
  };
}

/** Market metrics for one type at a given slot (pure, deterministic). */
export function metricsForType(slug: TypeKey, slot: number): TypeMetrics {
  const base = TYPES.find((t) => t.slug === slug);
  if (!base) {
    throw new Error(`Unknown property type: ${slug}`);
  }
  const rand = mulberry32(hash32(slot) ^ hash32(slug.length * 7919 + slug.charCodeAt(0)));
  const priceDrift = 1 + (rand() * 2 - 1) * PRICE_DRIFT_MAX;
  const yieldDrift = (rand() * 2 - 1) * YIELD_DRIFT_MAX;

  const startingPrice = Math.round((base.startingPrice * priceDrift) / 5000) * 5000;
  const rentYield = Math.round(Math.max(0.5, base.rentYield + yieldDrift) * 10) / 10;

  // Liquidity oscillates around the static dataset value.
  const order: Liquidity[] = ["Low", "Medium", "High"];
  const idx = order.indexOf(base.liquidity);
  const roll = rand();
  const shifted = roll < 0.2 ? Math.max(0, idx - 1) : roll > 0.8 ? Math.min(order.length - 1, idx + 1) : idx;

  return { startingPrice, rentYield, liquidity: order[shifted]! };
}

/** Full market snapshot for the current (or given) 48h slot. */
export function buildMarketSnapshot(now: number = Date.now()): MarketSnapshot {
  const slot = currentSlot(now);
  const types = {} as MarketSnapshot["types"];
  for (const t of TYPES) {
    types[t.slug] = {
      metrics: metricsForType(t.slug, slot),
      prev: metricsForType(t.slug, slot - 1),
    };
  }
  return { ...slotBoundary(slot), types };
}

/* ------------------------------------------------------------------ */
/* Behavioral interest tracking (localStorage)                        */
/* ------------------------------------------------------------------ */

export const INTEREST_STORAGE_KEY = "byh:type-interest";

interface InterestEvent {
  slug: TypeKey;
  kind: InterestKind;
  at: number;
}

export type InterestKind = "view" | "click" | "consult";

/** Events newer than 30 days only — stale history shouldn't drive ranking. */
const INTEREST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** A click is worth more than an impression; a consultation intent most of all. */
const KIND_WEIGHT: Record<InterestKind, number> = { view: 1, click: 3, consult: 6 };

function readEvents(): InterestEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INTEREST_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - INTEREST_TTL_MS;
    return parsed.filter(
      (e): e is InterestEvent =>
        !!e &&
        typeof e === "object" &&
        typeof (e as InterestEvent).slug === "string" &&
        typeof (e as InterestEvent).at === "number" &&
        (e as InterestEvent).at >= cutoff,
    );
  } catch {
    return [];
  }
}

function writeEvents(events: InterestEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(events.slice(-100)));
  } catch {
    // storage full / disabled — personalization silently degrades to static order
  }
}

export function recordTypeInterest(slug: TypeKey, kind: InterestKind = "click") {
  const events = readEvents();
  events.push({ slug, kind, at: Date.now() });
  writeEvents(events);
}

export function countTypeInterests(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of readEvents()) {
    counts[e.slug] = (counts[e.slug] ?? 0) + KIND_WEIGHT[e.kind];
  }
  return counts;
}

export function topInterestedType(): TypeKey | null {
  const counts = countTypeInterests();
  let best: TypeKey | null = null;
  let bestScore = 0;
  for (const [slug, score] of Object.entries(counts)) {
    if (score > bestScore) {
      best = slug as TypeKey;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Personal ranking: interested types first (strongest first), everything
 * else keeps the original order so users can still compare tiers — the
 * "upgrade your budget" ladder stays intact below the highlighted rows.
 */
export function personalRank(slug: TypeKey): number {
  const top = topInterestedType();
  if (!top) return 0;
  return slug === top ? -1 : 0;
}
