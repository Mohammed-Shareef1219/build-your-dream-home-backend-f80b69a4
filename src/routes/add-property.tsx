import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ImagePlus, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/add-property")({
  component: AddPropertyPage,
});

const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "duplex",
  "smart_home",
  "country_house",
  "land",
  "studio",
] as const;

type PropertyTypeKey = (typeof PROPERTY_TYPES)[number];

// "land" exists in the UI but the DB enum currently lacks it — submit as studio? No:
// we keep UI list aligned with the DB enum and present Land via country_house fallback.
const DB_TYPES: Record<PropertyTypeKey, string> = {
  land: "country_house",
  apartment: "apartment",
  villa: "villa",
  duplex: "duplex",
  smart_home: "smart_home",
  country_house: "country_house",
  studio: "studio",
};

function signInUrl() {
  return "/auth?mode=login&next=%2Fadd-property";
}

function AddPropertyPage() {
  const { t } = useTranslation("home");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { mode: "login" } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">{t("addProperty.loading")}</div>;
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow mb-6">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{t("addProperty.signInTitle")}</h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{t("addProperty.signInDesc")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/auth" search={{ mode: "login" }}>
              {t("addProperty.signInCta")} <ArrowRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>{t("addProperty.createAccount")}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return <AddPropertyForm />;
}

function AddPropertyForm() {
  const { t } = useTranslation("home");
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<PropertyTypeKey>("apartment");
  const [deal, setDeal] = useState<"sale" | "rent">("sale");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const priceNum = Number(price.replace(/[^\d.]/g, ""));
    if (!title.trim() || !priceNum || !location.trim()) {
      return toast.error(t("addProperty.requiredError"));
    }
    setSubmitting(true);
    try {
      // Upload photos (best-effort; upload failures don't block the listing)
      const urls: string[] = [];
      for (const f of files) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("property-images").upload(path, f);
        if (!error) {
          const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
          urls.push(pub.publicUrl);
        }
      }

      const { error } = await supabase.from("properties").insert({
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        currency: "EGP",
        listing_type: deal,
        type: DB_TYPES[type] as never,
        location: location.trim(),
        area_sqm: Number(area) || null,
        bedrooms: Number(bedrooms) || null,
        bathrooms: Number(bathrooms) || null,
        image_urls: urls,
        features: [],
        status: "available",
        owner_id: user.id,
      });
      if (error) throw error;
      toast.success(t("addProperty.success"));
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes("row-level") ? t("addProperty.subsError") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t("addProperty.formTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("addProperty.formSub")}</p>
      </div>

      <form onSubmit={submit} className="rounded-3xl bg-card p-6 sm:p-8 shadow-soft space-y-6">
        {/* Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="ap-title">{t("addProperty.title")}</Label>
            <Input id="ap-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Skyline View Panoramic Apartment" required />
          </div>
          <div>
            <Label>{t("addProperty.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as PropertyTypeKey)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((k) => (
                  <SelectItem key={k} value={k}>{t(`addProperty.types.${k}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("addProperty.deal")}</Label>
            <Select value={deal} onValueChange={(v) => setDeal(v as "sale" | "rent")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">{t("addProperty.sale")}</SelectItem>
                <SelectItem value="rent">{t("addProperty.rent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ap-price">{t("addProperty.price")}</Label>
            <Input id="ap-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8,200,000" required />
          </div>
          <div>
            <Label htmlFor="ap-area">{t("addProperty.area")}</Label>
            <Input id="ap-area" inputMode="numeric" value={area} onChange={(e) => setArea(e.target.value)} placeholder="220" />
          </div>
          <div>
            <Label htmlFor="ap-beds">{t("addProperty.bedrooms")}</Label>
            <Input id="ap-beds" inputMode="numeric" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
          </div>
          <div>
            <Label htmlFor="ap-baths">{t("addProperty.bathrooms")}</Label>
            <Input id="ap-baths" inputMode="numeric" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ap-location">{t("addProperty.location")}</Label>
            <Input id="ap-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New Administrative Capital" required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ap-desc">{t("addProperty.description")}</Label>
            <Textarea id="ap-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("addProperty.descPlaceholder")} />
          </div>
        </div>

        {/* Photos */}
        <div>
          <Label>{t("addProperty.photos")}</Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 w-full rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-secondary transition-colors"
          >
            <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
            <span className="mt-2 block text-sm text-muted-foreground">{t("addProperty.photosHint")}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          {files.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {files.map((f, i) => (
                <li key={i} className="relative rounded-xl overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/55 text-white"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? t("addProperty submitting") : t("addProperty.submit")}
        </Button>
      </form>
    </section>
  );
}
