import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ClipboardList, Lock } from "lucide-react";
import { submitConsultation } from "@/lib/consultation.functions";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "Free Consultation — BuildYourHome" },
      {
        name: "description",
        content:
          "Free consultation for your dream home — share your requirements and our team reaches out.",
      },
    ],
  }),
  component: ConsultationPage,
});

type Requirements = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  project_type: string;
  budget: string;
  timeline: string;
  description: string;
  notes: string;
};

function ConsultationPage() {
  const { t } = useTranslation("consultation");
  const { user, loading: authLoading } = useAuth();
  const submit = useServerFn(submitConsultation);
  const [loading, setLoading] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string };
  const [form, setForm] = useState<Requirements>({
    name: meta.full_name || meta.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    service: "",
    project_type: "",
    budget: "",
    timeline: "",
    description: "",
    notes: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("toast.signIn"));
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.service || !form.description.trim()) {
      toast.error(t("toast.required"));
      return;
    }
    setLoading(true);
    try {
      const res = await submit({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone || null,
          company: form.company || null,
          service: form.service || null,
          project_type: form.project_type || null,
          budget: form.budget || null,
          timeline: form.timeline || null,
          description: form.description || null,
          notes: form.notes || null,
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        },
      });
      if (!res?.id) {
        throw new Error(t("toast.notSaved"));
      }
      toast.success(t("toast.success", { ref: String(res.id).slice(0, 8) }));
      setForm((f) => ({
        ...f,
        phone: "",
        company: "",
        service: "",
        project_type: "",
        budget: "",
        timeline: "",
        description: "",
        notes: "",
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("toast.genericError");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () =>
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bg-[#f4f8fc] dark:bg-[#1a1a1a] text-foreground">
      <section
        className="flex flex-col md:flex-row items-center justify-between gap-10 px-6 md:px-16 py-16 text-white"
        style={{ background: "linear-gradient(90deg, #0a183d 70%, #2196f3 100%)" }}
      >
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-slate-200 mb-7">
            {t("hero.subtitle")}
          </p>
          <button
            onClick={scrollToForm}
            className="rounded-lg bg-[#eab308] px-9 py-3.5 font-bold text-[#23242a] hover:bg-[#facc15] transition"
          >
            {t("hero.cta")}
          </button>
        </div>
        <img
          className="w-[340px] h-[220px] object-cover rounded-2xl shadow-2xl bg-white"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
          alt={t("hero.imageAlt")}
        />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div ref={formTopRef} className="bg-card rounded-2xl shadow p-7">
          <div className="flex items-center gap-4 border-b pb-4 mb-6">
            <ClipboardList className="h-7 w-7 text-[#2196f3]" />
            <h2 className="text-xl md:text-2xl font-semibold">
              {t("form.heading")}
            </h2>
          </div>

          {authLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("form.loadingAccount")}
            </div>
          ) : !user ? (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center">
              <Lock className="h-8 w-8 mx-auto text-[#2196f3] mb-3" />
              <h3 className="text-lg font-semibold mb-2">{t("form.signInTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {t("form.signInText")}
              </p>
              <Link
                to="/auth"
                className="inline-block rounded-lg bg-[#2196f3] px-6 py-3 font-semibold text-white hover:bg-[#0d8bf2] transition"
              >
                {t("form.signInCta")}
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup title={t("form.name")}>
                <TextInput
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder={t("form.namePlaceholder")}
                />
              </FormGroup>
              <FormGroup title={t("form.email")}>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder={t("form.emailPlaceholder")}
                />
              </FormGroup>
              <FormGroup title={t("form.phone")}>
                <TextInput
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder={t("form.phonePlaceholder")}
                />
              </FormGroup>
              <FormGroup title={t("form.company")}>
                <TextInput
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder={t("form.companyPlaceholder")}
                />
              </FormGroup>

              <FormGroup title={t("form.service")}>
                <Select
                  value={form.service}
                  onChange={(v) => setForm({ ...form, service: v })}
                  options={[
                    ["", t("options.service.placeholder")],
                    ["architectural-design", t("options.service.architectural-design")],
                    ["interior-design", t("options.service.interior-design")],
                    ["property-purchase", t("options.service.property-purchase")],
                    ["investment-analysis", t("options.service.investment-analysis")],
                    ["construction", t("options.service.construction")],
                    ["other", t("options.service.other")],
                  ]}
                />
              </FormGroup>

              <FormGroup title={t("form.propertyType")}>
                <Select
                  value={form.project_type}
                  onChange={(v) => setForm({ ...form, project_type: v })}
                  options={[
                    ["", t("options.propertyType.placeholder")],
                    ["villa", t("options.propertyType.villa")],
                    ["apartment", t("options.propertyType.apartment")],
                    ["duplex", t("options.propertyType.duplex")],
                    ["single-floor", t("options.propertyType.single-floor")],
                    ["two-floor", t("options.propertyType.two-floor")],
                  ]}
                />
              </FormGroup>

              <FormGroup title={t("form.budget")}>
                <Select
                  value={form.budget}
                  onChange={(v) => setForm({ ...form, budget: v })}
                  options={[
                    ["", t("options.budget.placeholder")],
                    ["<500k", t("options.budget.<500k")],
                    ["500k-1m", t("options.budget.500k-1m")],
                    ["1m-3m", t("options.budget.1m-3m")],
                    ["3m-10m", t("options.budget.3m-10m")],
                    ["10m+", t("options.budget.10m+")],
                  ]}
                />
              </FormGroup>

              <FormGroup title={t("form.timeline")}>
                <Select
                  value={form.timeline}
                  onChange={(v) => setForm({ ...form, timeline: v })}
                  options={[
                    ["", t("options.timeline.placeholder")],
                    ["asap", t("options.timeline.asap")],
                    ["1-3-months", t("options.timeline.1-3-months")],
                    ["3-6-months", t("options.timeline.3-6-months")],
                    ["6-12-months", t("options.timeline.6-12-months")],
                    ["flexible", t("options.timeline.flexible")],
                  ]}
                />
              </FormGroup>

              <FormGroup title={t("form.description")} full>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t("form.descriptionPlaceholder")}
                  rows={5}
                  className="w-full rounded-lg border bg-background px-3 py-3 text-sm"
                />
              </FormGroup>

              <FormGroup title={t("form.notes")} full>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("form.notesPlaceholder")}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-3 text-sm"
                />
              </FormGroup>

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 mt-2 rounded-lg bg-[#2196f3] px-7 py-3.5 font-bold text-white hover:bg-[#0d8bf2] transition disabled:opacity-60"
              >
                {loading ? t("form.submitting") : t("form.submit")}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function FormGroup({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border bg-background px-3 py-3 text-sm"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border bg-background px-3 py-3 text-sm"
    />
  );
}
