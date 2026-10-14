import { createFileRoute } from "@tanstack/react-router";
import { TYPES } from "@/data/propertyTypes";
import type { TypeKey } from "@/data/propertyTypes";
import {
  ROTATION_INTERVAL_MS,
  currentSlot,
  metricsForType,
  slotBoundary,
} from "@/lib/propertyTypeInsights";

/**
 * GET /api/property-types
 *
 * Serves the 48-hour-rotated market metrics (starts-at price, rent yield,
 * liquidity) for the 6 core residential property types. The rotation is a
 * deterministic function of the current UTC 48h slot, so the server, any
 * cron worker hitting this endpoint (`?refresh=1` pre-warms the cache) and
 * the client-side fallback all agree without a database.
 *
 * Query params:
 *  - user_preference=villa   boosts that type to the front of `order`
 *  - refresh=1               bypass the in-slot cache (cron / cache purge)
 */

const SLUGS = TYPES.map((t) => t.slug);

interface TypePayload {
  startingPrice: number;
  rentYield: number;
  liquidity: string;
  prev: { startingPrice: number; rentYield: number; liquidity: string } | null;
}

interface Payload {
  data: Record<TypeKey, TypePayload>;
  meta: {
    generatedAt: number;
    nextRotationAt: number;
    slot: number;
    rotationIntervalHours: number;
    cached: boolean;
  };
  personalization: { topType: TypeKey | null; order: TypeKey[] };
}

let cache: { slot: number; payload: Payload["data"] } | null = null;

function buildData(slot: number): Payload["data"] {
  const data = {} as Payload["data"];
  for (const t of TYPES) {
    const metrics = metricsForType(t.slug, slot);
    data[t.slug] = {
      startingPrice: metrics.startingPrice,
      rentYield: metrics.rentYield,
      liquidity: metrics.liquidity,
      prev: (() => {
        const prev = metricsForType(t.slug, slot - 1);
        return {
          startingPrice: prev.startingPrice,
          rentYield: prev.rentYield,
          liquidity: prev.liquidity,
        };
      })(),
    };
  }
  return data;
}

export const Route = createFileRoute("/api/property-types")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const refresh = url.searchParams.get("refresh") === "1" || url.searchParams.get("refresh") === "true";

        const prefRaw = url.searchParams.get("user_preference")?.trim() as TypeKey | null;
        const preference = prefRaw && SLUGS.includes(prefRaw) ? prefRaw : null;

        const slot = currentSlot();
        let data: Payload["data"];
        let cached: boolean;

        if (!refresh && cache && cache.slot === slot) {
          data = cache.payload;
          cached = true;
        } else {
          data = buildData(slot);
          cache = { slot, payload: data };
          cached = false;
        }

        const boundary = slotBoundary(slot);
        const order: TypeKey[] = preference
          ? [preference, ...SLUGS.filter((s) => s !== preference)]
          : [...SLUGS];

        const payload: Payload = {
          data,
          meta: {
            generatedAt: boundary.generatedAt,
            nextRotationAt: boundary.nextRotationAt,
            slot,
            rotationIntervalHours: ROTATION_INTERVAL_MS / 3_600_000,
            cached,
          },
          personalization: { topType: preference, order },
        };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            // Values only change on the 48h boundary; a small CDN/browser
            // window keeps things snappy without ever serving stale slots.
            "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
