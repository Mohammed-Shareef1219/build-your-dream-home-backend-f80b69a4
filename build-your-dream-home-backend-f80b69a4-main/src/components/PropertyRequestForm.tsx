import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The exact values the `property_requests.property_type` CHECK constraint
 * accepts — order matters, keep in sync with
 * supabase/migrations/20260930000000_property_requests.sql
 */
export const REQUEST_PROPERTY_TYPES = [
  "شقق",
  "فيلا",
  "دوبليكس",
  "استوديوهات",
  "بيوت ذكية",
  "بيوت ريفية",
  "أراضي مونت سيتي",
  "أراضي مونت عجيبة",
] as const;

const emptyForm = {
  client_name: "",
  client_phone: "",
  client_email: "",
  property_code: "",
  property_type: "",
};

export function PropertyRequestForm() {
  const { t } = useTranslation("propertyRequest");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof typeof emptyForm) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.client_name.trim() ||
      !form.client_phone.trim() ||
      !form.client_email.trim() ||
      !form.property_code.trim() ||
      !form.property_type
    ) {
      toast.error(t("form.errors.required"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("property_requests").insert({
      client_name: form.client_name.trim(),
      client_phone: form.client_phone.trim(),
      client_email: form.client_email.trim(),
      property_code: form.property_code.trim(),
      property_type: form.property_type,
    });
    setSubmitting(false);
    if (error) {
      toast.error(t("form.errors.failed", { message: error.message }));
      return;
    }
    toast.success(t("form.success"));
    setSubmitted(true);
    setForm(emptyForm);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-card p-10 shadow-soft text-center max-w-xl mx-auto">
        <CheckCircle2 className="h-14 w-14 text-secondary mx-auto" />
        <h2 className="mt-4 text-2xl font-bold">{t("success.title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("success.body")}</p>
        <Button variant="brand" className="mt-6" onClick={() => setSubmitted(false)}>
          {t("success.again")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-card p-6 md:p-8 shadow-soft space-y-5 max-w-xl mx-auto"
      dir="rtl"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pr-name">{t("form.name")}</Label>
          <Input
            id="pr-name"
            value={form.client_name}
            onChange={(e) => set("client_name")(e.target.value)}
            placeholder={t("form.namePlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pr-phone">{t("form.phone")}</Label>
          <Input
            id="pr-phone"
            type="tel"
            dir="ltr"
            className="text-right"
            value={form.client_phone}
            onChange={(e) => set("client_phone")(e.target.value)}
            placeholder={t("form.phonePlaceholder")}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pr-email">{t("form.email")}</Label>
        <Input
          id="pr-email"
          type="email"
          dir="ltr"
          className="text-right"
          value={form.client_email}
          onChange={(e) => set("client_email")(e.target.value)}
          placeholder={t("form.emailPlaceholder")}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pr-code">{t("form.code")}</Label>
          <Input
            id="pr-code"
            dir="ltr"
            className="text-right"
            value={form.property_code}
            onChange={(e) => set("property_code")(e.target.value)}
            placeholder={t("form.codePlaceholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("form.type")}</Label>
          <Select value={form.property_type} onValueChange={set("property_type")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("form.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_PROPERTY_TYPES.map((typ) => (
                <SelectItem key={typ} value={typ}>
                  {typ}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full" disabled={submitting}>
        <Send className="h-4 w-4" />
        {submitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
