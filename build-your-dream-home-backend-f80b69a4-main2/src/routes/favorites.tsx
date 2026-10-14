import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useTranslation("account");
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites")
      .select("property_id, properties(*)")
      .eq("user_id", user.id);
    const props = (data ?? []).map((f: any) => f.properties).filter(Boolean) as Property[];
    setItems(props);
    setIds(new Set(props.map((p) => p.id)));
  };

  useEffect(() => { load(); }, [user]);

  if (authLoading) return <div className="mx-auto max-w-7xl px-4 py-16">{t("favorites.loading")}</div>;
  if (!user) return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">{t("favorites.signInHeading")}</h1>
      <Button variant="brand" size="lg" asChild><Link to="/auth">{t("favorites.signIn")}</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("favorites.title")}</h1>
      <p className="text-muted-foreground mb-8">{items.length} {items.length === 1 ? t("favorites.savedCountSingular") : t("favorites.savedCountPlural")}</p>
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground mb-4">{t("favorites.emptyHeading")}</p>
          <Button variant="brand" asChild><Link to="/properties">{t("favorites.browseListings")}</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} isFavorite={ids.has(p.id)}
              onFavoriteChange={(v) => {
                if (!v) {
                  setItems((prev) => prev.filter((x) => x.id !== p.id));
                  setIds((prev) => { const n = new Set(prev); n.delete(p.id); return n; });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
