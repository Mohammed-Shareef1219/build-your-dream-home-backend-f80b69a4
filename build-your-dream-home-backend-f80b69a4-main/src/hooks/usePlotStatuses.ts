import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlotStatus } from "@/land.projects";

/**
 * usePlotStatuses
 *
 * Live plot statuses for one land project:
 *  1. Initial fetch of every row in public.plots for the project code.
 *  2. A Supabase Realtime (postgres_changes) subscription so status changes
 *     made by an admin (dashboard / Table Editor / future admin UI) appear
 *     on the map instantly, without a page reload.
 *
 * If the plots table is not deployed yet, the fetch error is swallowed and
 * the map silently falls back to the static statuses from land.projects.ts.
 */
const VALID: PlotStatus[] = ["available", "reserved", "sold", "security"];

export function usePlotStatuses(projectCode: string): Record<string, PlotStatus> {
  const [statuses, setStatuses] = useState<Record<string, PlotStatus>>({});

  useEffect(() => {
    let cancelled = false;

    // 1) Initial snapshot
    supabase
      .from("plots")
      .select("plot_number,status")
      .eq("project_code", projectCode)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, PlotStatus> = {};
        for (const row of data) {
          if (VALID.includes(row.status as PlotStatus)) {
            map[row.plot_number] = row.status as PlotStatus;
          }
        }
        if (!cancelled && Object.keys(map).length > 0) setStatuses(map);
      });

    // 2) Realtime updates
    const channel = supabase
      .channel(`plots:${projectCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "plots",
          filter: `project_code=eq.${projectCode}`,
        },
        (payload) => {
          const row = payload.new as { plot_number?: string; status?: string } | null;
          if (!row?.plot_number || !row.status) return;
          if (!VALID.includes(row.status as PlotStatus)) return;
          setStatuses((prev) => ({ ...prev, [row.plot_number!]: row.status as PlotStatus }));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [projectCode]);

  return statuses;
}
