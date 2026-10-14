import { Link } from "@tanstack/react-router";
import { Heart, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export function PropertyCard({
  property,
  isFavorite,
  onFavoriteChange,
}: {
  property: Property;
  isFavorite?: boolean;
  onFavoriteChange?: (favored: boolean) => void;
}) {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t("propertyCard.signInToSave"));
      return;
    }
    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", property.id);
      if (error) return toast.error(error.message);
      toast.success(t("propertyCard.removedFromFavorites"));
      onFavoriteChange?.(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, property_id: property.id });
      if (error) return toast.error(error.message);
      toast.success(t("propertyCard.addedToFavorites"));
      onFavoriteChange?.(true);
    }
  };

  const img = property.image_urls?.[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop";

  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={img}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {property.featured && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-soft">
            ⭐ {t("propertyCard.featured")}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize">
          {property.type.replace("_", " ")}
        </span>
        <button
          onClick={toggleFavorite}
          aria-label={t("propertyCard.toggleFavorite")}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? "fill-destructive text-destructive" : "text-foreground"
            }`}
          />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1">{property.title}</h3>
        </div>
        {property.location && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5" /> {property.location}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.bathrooms}
            </span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-4 w-4" /> {property.area_sqm}m²
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{t("propertyCard.startingFrom")}</div>
            <div className="text-xl font-bold text-primary">
              {new Intl.NumberFormat("en-US").format(Number(property.price))} {property.currency}
            </div>
          </div>
          <Button variant="secondary" size="sm" className="pointer-events-none">
            {t("propertyCard.view")}
          </Button>
        </div>
      </div>
    </Link>
  );
}
