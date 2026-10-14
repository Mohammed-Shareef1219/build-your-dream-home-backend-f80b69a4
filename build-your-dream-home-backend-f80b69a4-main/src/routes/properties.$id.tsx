import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BedDouble, Bath, Maximize, MapPin, Heart, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetail,
});

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { setProperty(data); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!user || !property) return;
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", property.id).maybeSingle()
      .then(({ data }) => setIsFav(!!data));
  }, [user, property]);

  const toggleFav = async () => {
    if (!user) return toast.error("Please sign in to save favorites");
    if (!property) return;
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", property.id);
      setIsFav(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: property.id });
      setIsFav(true);
      toast.success("Added to favorites");
    }
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!property) return;
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      property_id: property.id,
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Inquiry sent! We'll be in touch soon.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-16">Loading…</div>;
  if (!property) return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <p className="text-muted-foreground mb-4">Property not found.</p>
      <Button asChild><Link to="/properties">Back to listings</Link></Button>
    </div>
  );

  const images = property.image_urls?.length
    ? property.image_urls
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-muted shadow-elegant mb-3">
            <img src={images[activeImg]} alt={property.title} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-lg overflow-hidden ${activeImg === i ? "ring-2 ring-secondary" : "opacity-70 hover:opacity-100"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full capitalize mb-2">
                  {property.type.replace("_", " ")}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
                {property.location && (
                  <p className="flex items-center gap-1 text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" /> {property.location}
                  </p>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={toggleFav}>
                <Heart className={isFav ? "fill-destructive text-destructive" : ""} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 py-4 border-y border-border my-6">
              {property.bedrooms != null && <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-secondary" /> <span><strong>{property.bedrooms}</strong> beds</span></div>}
              {property.bathrooms != null && <div className="flex items-center gap-2"><Bath className="h-5 w-5 text-secondary" /> <span><strong>{property.bathrooms}</strong> baths</span></div>}
              {property.area_sqm != null && <div className="flex items-center gap-2"><Maximize className="h-5 w-5 text-secondary" /> <span><strong>{property.area_sqm}</strong> m²</span></div>}
            </div>

            {property.description && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">About this property</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{property.description}</p>
              </div>
            )}

            {property.features?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {property.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="rounded-2xl bg-card shadow-elegant p-6">
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {new Intl.NumberFormat("en-US").format(Number(property.price))} {property.currency}
            </div>
            <div className="text-xs text-muted-foreground capitalize mb-4">Status: {property.status}</div>

            <form onSubmit={submitInquiry} className="space-y-3 pt-4 border-t border-border">
              <div className="font-semibold">Inquire about this property</div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Message *</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
              <Button type="submit" variant="brand" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
