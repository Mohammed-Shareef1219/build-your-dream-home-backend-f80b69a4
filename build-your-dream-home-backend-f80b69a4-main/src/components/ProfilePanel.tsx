import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User as UserIcon, Mail, Phone, Camera, Loader2, Clock, CheckCircle2, UserCheck,
  Calendar, Video, MapPin, Heart, Sparkles, Settings2, Sun, Moon, Languages, LogOut, LogIn, Settings,
} from "lucide-react";

type TFn = (key: string) => string;

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
});

export function ProfilePanel() {
  const { t } = useTranslation("common");
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, dir } = useLanguage();
  const [openState, setOpenState] = useState(false);
  const tp = (key: string) => t(`profilePanel.${key}`);
  const side = dir === "rtl" ? "left" : "right";

  return (
    <Sheet open={openState} onOpenChange={setOpenState}>
      <SheetTrigger asChild>
        <Button
          variant="brand"
          size="icon"
          aria-label={tp("open")}
          className={`fixed bottom-6 z-40 h-12 w-12 rounded-full shadow-lg ${dir === "rtl" ? "left-6" : "right-6"}`}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-full sm:max-w-md md:max-w-lg overflow-y-auto p-0">
        <div className="p-5 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
          <SheetHeader className="text-start">
            <SheetTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />{tp("title")}</SheetTitle>
            <SheetDescription>{tp("desc")}</SheetDescription>
          </SheetHeader>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? tp("light") : tp("dark")}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleLang} className="gap-2">
              <Languages className="h-4 w-4" /> {lang === "en" ? "العربية" : "English"}
            </Button>
          </div>
        </div>

        {!user ? (
          <SignedOut tp={tp} onNav={() => setOpenState(false)} />
        ) : (
          <div className="p-5 space-y-6">
            <SettingsForm tp={tp} />
            <Separator />
            <ConsultationTracker tp={tp} userId={user.id} userEmail={user.email ?? ""} onNav={() => setOpenState(false)} />
            <Separator />
            <AIMatching tp={tp} userId={user.id} onNav={() => setOpenState(false)} />
            <Separator />
            <ScheduledTours tp={tp} userId={user.id} onNav={() => setOpenState(false)} />
            <Separator />
            <SavedListings tp={tp} userId={user.id} onNav={() => setOpenState(false)} />
            <Separator />
            <Button variant="outline" className="w-full gap-2" onClick={() => { signOut(); setOpenState(false); }}>
              <LogOut className="h-4 w-4" /> {tp("signOut")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SignedOut({ tp, onNav }: { tp: TFn; onNav: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-lg border border-dashed p-6 text-center">
        <UserIcon className="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 className="mt-3 font-semibold">{tp("signInTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tp("signInDesc")}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <Button asChild variant="outline" onClick={onNav}><Link to="/auth"><LogIn className="h-4 w-4" /> {tp("login")}</Link></Button>
          <Button asChild variant="brand" onClick={onNav}><Link to="/auth" search={{ mode: "signup" }}>{tp("signup")}</Link></Button>
        </div>
      </div>
    </div>
  );
}

function SettingsForm({ tp }: { tp: TFn }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      setProfile(data);
      setForm({
        full_name: (data?.display_name as string) || (meta.full_name as string) || (meta.name as string) || "",
        phone: (data?.phone as string) ?? "",
      });
    });
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await (supabase.from("profiles") as any)
      .update({ display_name: parsed.data.full_name, phone: parsed.data.phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    if (file.size > 4 * 1024 * 1024) return toast.error("Max 4MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setProfile((p: any) => p ? { ...p, avatar_url: pub.publicUrl } : p);
    setUploading(false); toast.success("Photo updated");
  };

  if (!user) return null;
  const initials = (form.full_name || user.email || "U").split(/[\s@]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");
  const googleAvatar = (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture;
  const avatarSrc = profile?.avatar_url || googleAvatar;

  return (
    <section>
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Settings2 className="h-4 w-4" /> {tp("settings")}</h3>
      <form onSubmit={onSave} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={form.full_name} />}
            <AvatarFallback className="bg-brand-gradient text-white text-lg">{initials || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {tp("changePhoto")}
            </Button>
          </div>
        </div>
        <div>
          <Label><UserIcon className="inline h-3.5 w-3.5 me-1" /> {tp("fullName")}</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <Label><Mail className="inline h-3.5 w-3.5 me-1" /> {tp("email")}</Label>
          <Input value={user.email ?? ""} disabled />
        </div>
        <div>
          <Label><Phone className="inline h-3.5 w-3.5 me-1" /> {tp("phone")}</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+20 111 639 205" />
        </div>
        <Button type="submit" variant="brand" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {saving ? tp("saving") : tp("save")}
        </Button>
      </form>
    </section>
  );
}

function ConsultationTracker({ tp, userId, userEmail, onNav }: { tp: TFn; userId: string; userEmail: string; onNav: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("consultations").select("*").or(`user_id.eq.${userId},email.eq.${userEmail}`)
      .order("created_at", { ascending: false }).limit(3).then(({ data }) => setItems(data ?? []));
  }, [userId, userEmail]);
  const badge = (s: string) => {
    if (s === "assigned" || s === "expert_assigned") return <Badge className="bg-secondary text-secondary-foreground"><UserCheck className="h-3 w-3 me-1" />{tp("assigned")}</Badge>;
    if (s === "in_progress" || s === "processing") return <Badge className="bg-accent text-accent-foreground"><Settings2 className="h-3 w-3 me-1" />{tp("processing")}</Badge>;
    return <Badge variant="secondary"><Clock className="h-3 w-3 me-1" />{tp("pending")}</Badge>;
  };
  return (
    <section>
      <h3 className="font-semibold mb-1 flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> {tp("consult")}</h3>
      <p className="text-xs text-muted-foreground mb-3">{tp("consultDesc")}</p>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {tp("noConsult")} <Link to="/consultation" onClick={onNav} className="text-secondary font-medium">{tp("bookConsult")}</Link>
        </div>
      ) : items.map((c) => {
        const created = new Date(c.created_at).getTime();
        const rem = Math.max(0, created + 86400000 - Date.now());
        const hh = Math.floor(rem / 3600000), mm = Math.floor((rem % 3600000) / 60000);
        return (
          <div key={c.id} className="rounded-lg border p-3 mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{c.project_type || tp("consultationFallback")}</div>
              <div className="text-xs text-muted-foreground truncate">{c.message}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {badge(c.status)}
              <span className="text-[10px] font-mono text-muted-foreground">
                {rem > 0 ? `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${tp("left")}` : tp("due")}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function AIMatching({ tp, userId, onNav }: { tp: TFn; userId: string; onNav: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("preferred_property_type,budget_min,budget_max").eq("id", userId).maybeSingle().then(({ data }: any) => {
      let q = supabase.from("properties").select("*").eq("status", "available").limit(3);
      if (data?.preferred_property_type) q = q.eq("type", data.preferred_property_type);
      if (data?.budget_min) q = q.gte("price", data.budget_min);
      if (data?.budget_max) q = q.lte("price", data.budget_max);
      q.then(({ data: p }) => setItems(p ?? []));
    });
  }, [userId]);
  return (
    <section>
      <h3 className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> {tp("ai")}</h3>
      <p className="text-xs text-muted-foreground mb-3">{tp("aiDesc")}</p>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{tp("noAi")}</div>
      ) : items.map((p) => (
        <Link key={p.id} to="/properties/$id" params={{ id: p.id }} onClick={onNav}
          className="flex items-center gap-3 rounded-lg border p-2 mb-2 hover:bg-muted/50">
          {p.image_urls?.[0] && <img src={p.image_urls[0]} alt={p.title} className="h-12 w-12 rounded object-cover" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{p.title}</div>
            <Badge variant="outline" className="mt-0.5 text-[9px] border-secondary text-secondary">
              <CheckCircle2 className="h-2.5 w-2.5 me-1" /> {tp("match")}
            </Badge>
          </div>
          <div className="text-xs font-semibold shrink-0">{p.currency} {Number(p.price).toLocaleString()}</div>
        </Link>
      ))}
    </section>
  );
}

function ScheduledTours({ tp, userId, onNav }: { tp: TFn; userId: string; onNav: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    ((supabase as any).from("property_tours")).select("*").eq("user_id", userId)
      .order("scheduled_at", { ascending: true }).limit(3)
      .then(({ data }: any) => setItems(data ?? []));
  }, [userId]);
  return (
    <section>
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-secondary" /> {tp("tours")}</h3>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {tp("noTours")} <Link to="/properties" onClick={onNav} className="text-secondary font-medium">{tp("browse")}</Link>
        </div>
      ) : items.map((t2) => {
        const d = new Date(t2.scheduled_at);
        return (
          <div key={t2.id} className="rounded-lg border p-3 mb-2 flex items-center gap-3">
            <div className="rounded-md bg-muted p-2">
              {t2.tour_type === "virtual" ? <Video className="h-4 w-4 text-secondary" /> : <MapPin className="h-4 w-4 text-accent" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{t2.property_name}</div>
              <div className="text-xs text-muted-foreground">{d.toLocaleDateString()} • {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <Badge variant="outline" className="text-[10px]">{t2.tour_type === "virtual" ? tp("virtual") : tp("physical")}</Badge>
          </div>
        );
      })}
    </section>
  );
}

function SavedListings({ tp, userId, onNav }: { tp: TFn; userId: string; onNav: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("favorites").select("property_id, properties(*)").eq("user_id", userId).limit(4)
      .then(({ data }) => setItems((data ?? []).map((f: any) => f.properties).filter(Boolean)));
  }, [userId]);
  return (
    <section>
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" /> {tp("saved")}</h3>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{tp("noSaved")}</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((p) => (
            <Link key={p.id} to="/properties/$id" params={{ id: p.id }} onClick={onNav}
              className="rounded-lg border overflow-hidden hover:shadow-soft transition">
              {p.image_urls?.[0] && <img src={p.image_urls[0]} alt={p.title} className="h-20 w-full object-cover" />}
              <div className="p-2">
                <div className="text-xs font-medium truncate">{p.title}</div>
                <div className="text-[10px] text-muted-foreground">{p.currency} {Number(p.price).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
