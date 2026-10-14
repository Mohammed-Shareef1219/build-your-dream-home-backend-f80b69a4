import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Star, Mail, MessageSquare } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
type Consultation = Database["public"]["Tables"]["consultations"]["Row"];

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const TYPES = ["villa", "apartment", "duplex", "country_house", "studio", "smart_home"] as const;

const emptyForm = {
  title: "",
  description: "",
  type: "villa" as (typeof TYPES)[number],
  price: "",
  currency: "AED",
  location: "",
  area_sqm: "",
  bedrooms: "",
  bathrooms: "",
  featured: false,
  features: "",
};

function AdminPage() {
  const { t } = useTranslation("account");
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [p, i, c] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("created_at", { ascending: false }),
    ]);
    setProperties(p.data ?? []);
    setInquiries(i.data ?? []);
    setConsultations(c.data ?? []);
  };

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  const resetForm = () => { setEditing(null); setForm(emptyForm); setImages([]); };

  const startEdit = (p: Property) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? "", type: p.type,
      price: String(p.price), currency: p.currency, location: p.location ?? "",
      area_sqm: p.area_sqm != null ? String(p.area_sqm) : "",
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      featured: p.featured, features: (p.features ?? []).join(", "),
    });
    setImages(p.image_urls ?? []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    setImages((prev) => [...prev, data.publicUrl]);
    setUploading(false);
    e.target.value = "";
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) return toast.error(t("admin.toasts.titlePriceRequired"));
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      type: form.type,
      price: Number(form.price),
      currency: form.currency,
      location: form.location.trim() || null,
      area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      featured: form.featured,
      image_urls: images,
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const res = editing
      ? await supabase.from("properties").update(payload).eq("id", editing.id)
      : await supabase.from("properties").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? t("admin.toasts.propertyUpdated") : t("admin.toasts.propertyCreated"));
    resetForm();
    loadAll();
  };

  const deleteProperty = async (id: string) => {
    if (!confirm(t("admin.confirm.deleteProperty"))) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("admin.toasts.deleted"));
    loadAll();
  };

  const deleteInquiry = async (id: string) => {
    await supabase.from("inquiries").delete().eq("id", id);
    loadAll();
  };
  const deleteConsultation = async (id: string) => {
    await supabase.from("consultations").delete().eq("id", id);
    loadAll();
  };

  if (authLoading) return <div className="mx-auto max-w-7xl px-4 py-16">{t("admin.loading")}</div>;
  if (!user) return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">{t("admin.signInRequired")}</h1>
      <Button asChild variant="brand"><Link to="/auth">{t("admin.signIn")}</Link></Button>
    </div>
  );
  if (!isAdmin) return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2">{t("admin.accessRequired")}</h1>
      <p className="text-muted-foreground mb-4">{t("admin.yourUserId")} <code className="text-xs">{user.id}</code></p>
      <p className="text-sm text-muted-foreground">{t("admin.askDeveloper")}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">{t("admin.heading")}</h1>

      <Tabs defaultValue="properties">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">{t("admin.tabs.properties")} ({properties.length})</TabsTrigger>
          <TabsTrigger value="inquiries"><Mail className="h-4 w-4 mr-1" />{t("admin.tabs.inquiries")} ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="consultations"><MessageSquare className="h-4 w-4 mr-1" />{t("admin.tabs.consultations")} ({consultations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-8">
          <form onSubmit={save} className="bg-card rounded-2xl shadow-soft p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editing ? t("admin.form.editProperty") : t("admin.form.addProperty")}</h2>
              {editing && <Button type="button" variant="ghost" size="sm" onClick={resetForm}>{t("admin.form.cancel")}</Button>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>{t("admin.form.titleLabel")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div>
                <Label>{t("admin.form.typeLabel")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((typ) => <SelectItem key={typ} value={typ} className="capitalize">{t(`admin.form.types.${typ}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("admin.form.priceLabel")}</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div><Label>{t("admin.form.currencyLabel")}</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
              <div><Label>{t("admin.form.locationLabel")}</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>{t("admin.form.areaLabel")}</Label><Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} /></div>
              <div><Label>{t("admin.form.bedroomsLabel")}</Label><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} /></div>
              <div><Label>{t("admin.form.bathroomsLabel")}</Label><Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} /></div>
            </div>
            <div><Label>{t("admin.form.descriptionLabel")}</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>{t("admin.form.featuresLabel")}</Label><Input value={form.features} placeholder={t("admin.form.featuresPlaceholder")} onChange={(e) => setForm({ ...form, features: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <Checkbox id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: !!v })} />
              <Label htmlFor="featured" className="cursor-pointer">{t("admin.form.featured")}</Label>
            </div>

            <div>
              <Label>{t("admin.form.imagesLabel")}</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-secondary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-secondary transition-colors">
                  <Upload className="h-5 w-5 mb-1" />
                  <span className="text-xs">{uploading ? t("admin.form.uploading") : t("admin.form.upload")}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
                </label>
              </div>
            </div>

            <Button type="submit" variant="brand" size="lg" disabled={saving}>
              <Plus /> {saving ? t("admin.form.saving") : editing ? t("admin.form.updateProperty") : t("admin.form.createProperty")}
            </Button>
          </form>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{t("admin.propertiesList.heading")}</h2>
            {properties.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-soft">
                <img src={p.image_urls?.[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200"} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {p.featured && <Star className="h-4 w-4 fill-accent text-accent" />}
                    <span className="font-semibold truncate">{p.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{t(`admin.form.types.${p.type}`)} · {new Intl.NumberFormat().format(Number(p.price))} {p.currency}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => startEdit(p)}>{t("admin.propertiesList.edit")}</Button>
                <Button variant="ghost" size="icon" onClick={() => deleteProperty(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-3">
          {inquiries.length === 0 ? <p className="text-muted-foreground">{t("admin.inquiries.empty")}</p> :
            inquiries.map((i) => (
              <div key={i.id} className="bg-card rounded-xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-sm text-muted-foreground">{i.email} {i.phone && `· ${i.phone}`}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteInquiry(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <p className="text-sm whitespace-pre-wrap mb-2">{i.message}</p>
                <div className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</div>
              </div>
            ))}
        </TabsContent>

        <TabsContent value="consultations" className="space-y-3">
          {consultations.length === 0 ? <p className="text-muted-foreground">{t("admin.consultations.empty")}</p> :
            consultations.map((c) => (
              <div key={c.id} className="bg-card rounded-xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.email} {c.phone && `· ${c.phone}`}</div>
                    {(c.project_type || c.budget) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {c.project_type && <>{t("admin.consultations.project")} {c.project_type}</>}{c.project_type && c.budget && " · "}{c.budget && <>{t("admin.consultations.budget")} {c.budget}</>}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteConsultation(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <p className="text-sm whitespace-pre-wrap mb-2">{c.message}</p>
                <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
