import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";


export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "login" | "signup" } => ({
    mode: (s.mode === "signup" ? "signup" : "login") as "login" | "signup",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  return mode === "signup" ? <SignupWizard /> : <LoginForm />;
}

/* -------------------------- LOGIN -------------------------- */

const useLoginSchema = () => {
  const { t } = useTranslation("auth");
  return z.object({
    email: z.string().trim().email(t("validation.invalidEmail")).max(255),
    password: z.string().min(6, t("validation.minPassword")).max(72),
  });
};

function LoginForm() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const loginSchema = useLoginSchema();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("login.welcomeBack"));
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 animate-[bgSlide_20s_infinite] bg-cover bg-center brightness-[0.6]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')" }} />
      <style>{`
        @keyframes bgSlide {
          0%,100% { background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'); }
          33% { background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'); }
          66% { background-image: url('https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'); }
        }
      `}</style>

      <div className="w-[380px] max-w-[90%] rounded-xl bg-white/95 backdrop-blur-md border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-8 text-center">
        <h1 className="mb-6 text-[28px] font-semibold text-[#2d3748]">{t("login.title")}</h1>

        <button
          type="button"
          onClick={onGoogle}
          className="mb-5 w-full flex items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-3 py-3 text-sm font-medium text-[#3c4043] hover:bg-[#f7f8f8] transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0f2740" />
            <path d="M16 6.5L25 14v10.5a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-5v6h-5A1.5 1.5 0 0 1 7 24.5V14l9-7.5z" fill="#f4b73d" />
            <path d="M16 6.5L25 14M16 6.5L7 14" stroke="#0f2740" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {t("login.googleButton")}
        </button>

        <div className="my-5 flex items-center gap-4 text-sm text-[#a0aec0]">
          <div className="h-px flex-1 bg-[#e2e8f0]" />
          <span>{t("login.or")}</span>
          <div className="h-px flex-1 bg-[#e2e8f0]" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5 text-left">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#4a5568]">{t("login.emailLabel")}</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[15px] transition-all focus:border-[#4299e1] focus:outline-none focus:ring-[3px] focus:ring-[#4299e1]/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#4a5568]">{t("login.passwordLabel")}</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[15px] transition-all focus:border-[#4299e1] focus:outline-none focus:ring-[3px] focus:ring-[#4299e1]/20"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-[#4299e1]" />
              <span className="text-[#4a5568]">{t("login.rememberMe")}</span>
            </label>
            <Link to="/forgot-password" className="text-[#4299e1] hover:text-[#3182ce] hover:underline">{t("login.forgotPassword")}</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#4299e1] px-4 py-3.5 text-base font-medium text-white shadow-[0_2px_5px_rgba(66,153,225,0.2)] transition-all hover:bg-[#3182ce] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(66,153,225,0.3)] disabled:opacity-50 disabled:hover:transform-none"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <div className="mt-5 text-sm text-[#4a5568]">
          {t("login.noAccount")}{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
            className="font-medium text-[#4299e1] hover:text-[#3182ce] hover:underline"
          >
            {t("login.register")}
          </button>
        </div>
      </div>
    </div>
  );
}


/* -------------------------- SIGNUP WIZARD -------------------------- */

const BG_SLIDES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
];

type SignupData = {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  projectType: string;
  budget: string;
  timeline: string;
  receiveEmails: boolean;
  receiveSMS: boolean;
  serviceType: string;
  shareProjects: boolean;
  agreeTerms: boolean;
  agreeDataUsage: boolean;
};

const initialData: SignupData = {
  fullName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  confirmPassword: "",
  projectType: "",
  budget: "",
  timeline: "",
  receiveEmails: true,
  receiveSMS: false,
  serviceType: "investment",
  shareProjects: false,
  agreeTerms: false,
  agreeDataUsage: false,
};

function SignupWizard() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(t("signup.step4.noFileChosen"));
  const [data, setData] = useState<SignupData>(initialData);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % BG_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const update = <K extends keyof SignupData>(k: K, v: SignupData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!data.fullName.trim()) return t("signup.validation.fullNameRequired");
      if (!/^\S+@\S+\.\S+$/.test(data.email)) return t("signup.validation.validEmailRequired");
      if (!data.phone.trim()) return t("signup.validation.phoneRequired");
    }
    if (s === 2) {
      if (!data.username.trim()) return t("signup.validation.usernameRequired");
      if (data.password.length < 6) return t("signup.validation.passwordMinLength");
      if (data.password !== data.confirmPassword) return t("signup.validation.passwordsDoNotMatch");
    }
    if (s === 3) {
      if (!data.projectType) return t("signup.validation.selectProjectType");
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return toast.error(err);
    setStep((s) => Math.min(4, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.agreeTerms) return toast.error(t("signup.validation.agreeTermsRequired"));
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.fullName,
          full_name: data.fullName,
          username: data.username,
          phone: data.phone,
          account_type: "Customer",
          project_type: data.projectType,
          budget: data.budget,
          timeline: data.timeline,
          service_type: data.serviceType,
          receive_emails: data.receiveEmails,
          receive_sms: data.receiveSMS,
          share_projects: data.shareProjects,
          agree_data_usage: data.agreeDataUsage,
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        setLoading(false);
        return toast.error(signInError.message);
      }
    }
    setLoading(false);
    toast.success(t("signup.accountCreated"));
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background slider */}
      <div className="absolute inset-0 -z-10">
        {BG_SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms]"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === slide ? 0.9 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10 items-start">
        {/* Welcome */}
        <div className="text-white pt-6 lg:pt-16">
          <h1
            className="font-bold leading-tight mb-4"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
              color: "#f49208",
            }}
          >
            {t("signup.welcomeTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-md leading-relaxed">
            {t("signup.welcomeSubtitle")}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/97 backdrop-blur rounded-xl shadow-elegant border border-border p-6 md:p-8 lg:ml-auto w-full max-w-[650px] text-[#2c3e50]">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#2c3e50]">{t("signup.cardTitle")}</h2>
            <p className="mt-1 text-[#5a6b7a]">{t("signup.cardSubtitle")}</p>
          </div>

          {/* Progress bar */}
          <div className="relative flex justify-between mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#ecf0f1] -translate-y-1/2 z-0" />
            {[1, 2, 3, 4].map((n) => {
              const completed = n < step;
              const active = n === step;
              return (
                <div
                  key={n}
                  className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    completed
                      ? "bg-[#2ecc71] text-white border-[#2ecc71]"
                      : active
                      ? "bg-[#3498db] text-white border-[#3498db]"
                      : "bg-[#ecf0f1] text-[#7f8c8d] border-[#ddd]"
                  }`}
                >
                  {n}
                </div>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {step === 1 && (
              <Section title={t("signup.step1.title")}>
                <Field label={t("signup.step1.fullName")}>
                  <Input value={data.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder={t("signup.step1.fullNamePlaceholder")} />
                </Field>
                <Field label={t("signup.step1.email")}>
                  <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder={t("signup.step1.emailPlaceholder")} />
                </Field>
                <Field label={t("signup.step1.phone")}>
                  <Input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder={t("signup.step1.phonePlaceholder")} />
                </Field>
                <div className="flex justify-end pt-2">
                  <NavBtn onClick={next}>{t("signup.step1.next")}</NavBtn>
                </div>
              </Section>
            )}

            {step === 2 && (
              <Section title={t("signup.step2.title")}>
                <Field label={t("signup.step2.username")}>
                  <Input value={data.username} onChange={(e) => update("username", e.target.value)} placeholder={t("signup.step2.usernamePlaceholder")} />
                </Field>
                <Field label={t("signup.step2.password")}>
                  <Input type="password" value={data.password} onChange={(e) => update("password", e.target.value)} placeholder={t("signup.step2.passwordPlaceholder")} />
                </Field>
                <Field label={t("signup.step2.confirmPassword")}>
                  <Input type="password" value={data.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder={t("signup.step2.confirmPasswordPlaceholder")} />
                </Field>
                <div className="flex justify-between pt-2">
                  <PrevBtn onClick={prev}>{t("signup.step2.previous")}</PrevBtn>
                  <NavBtn onClick={next}>{t("signup.step2.next")}</NavBtn>
                </div>
              </Section>
            )}

            {step === 3 && (
              <Section title={t("signup.step3.title")}>
                <Field label={t("signup.step3.projectType")}>
                  <select
                    className="w-full h-11 rounded-md border-2 border-[#ddd] bg-white px-3 text-base focus:border-[#3498db] focus:outline-none focus:ring-2 focus:ring-[#3498db]/20"
                    value={data.projectType}
                    onChange={(e) => update("projectType", e.target.value)}
                  >
                    <option value="" disabled>{t("signup.step3.selectProjectType")}</option>
                    <option value="residential">{t("signup.step3.residential")}</option>
                    <option value="commercial">{t("signup.step3.commercial")}</option>
                    <option value="industrial">{t("signup.step3.industrial")}</option>
                  </select>
                </Field>
                <Field label={t("signup.step3.budget")}>
                  <Input value={data.budget} onChange={(e) => update("budget", e.target.value)} placeholder={t("signup.step3.budgetPlaceholder")} />
                </Field>
                <Field label={t("signup.step3.timeline")}>
                  <Input value={data.timeline} onChange={(e) => update("timeline", e.target.value)} placeholder={t("signup.step3.timelinePlaceholder")} />
                </Field>
                <div className="flex justify-between pt-2">
                  <PrevBtn onClick={prev}>{t("signup.step3.previous")}</PrevBtn>
                  <NavBtn onClick={next}>{t("signup.step3.next")}</NavBtn>
                </div>
              </Section>
            )}

            {step === 4 && (
              <Section title={t("signup.step4.title")}>
                <div>
                  <Label className="block mb-2 text-[#2c3e50]">{t("signup.step4.communicationPreferences")}</Label>
                  <Check id="receiveEmails" checked={data.receiveEmails} onChange={(v) => update("receiveEmails", v)} label={t("signup.step4.receiveEmails")} />
                  <Check id="receiveSMS" checked={data.receiveSMS} onChange={(v) => update("receiveSMS", v)} label={t("signup.step4.receiveSMS")} />
                </div>

                <Field label={t("signup.step4.requiredServiceType")}>
                  <select
                    className="w-full h-11 rounded-md border-2 border-[#ddd] bg-white px-3 text-base focus:border-[#3498db] focus:outline-none focus:ring-2 focus:ring-[#3498db]/20"
                    value={data.serviceType}
                    onChange={(e) => update("serviceType", e.target.value)}
                  >
                    <option value="" disabled>{t("signup.step4.selectServiceType")}</option>
                    <option value="design">{t("signup.step4.design")}</option>
                    <option value="construction">{t("signup.step4.construction")}</option>
                    <option value="consultation">{t("signup.step4.consultation")}</option>
                    <option value="investment">{t("signup.step4.investment")}</option>
                  </select>
                </Field>

                <Check id="shareProjects" checked={data.shareProjects} onChange={(v) => update("shareProjects", v)} label={t("signup.step4.shareProjects")} />

                <div>
                  <Label className="block mb-2 text-[#2c3e50]">{t("signup.step4.uploadDocument")}</Label>
                  <label className="block cursor-pointer rounded-md border-2 border-dashed border-[#3498db] bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#3498db] text-center py-3 font-medium transition-colors">
                    {t("signup.step4.chooseFile")}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? t("signup.step4.noFileChosen"))}
                    />
                  </label>
                  <div className="mt-2 text-sm text-[#5a6b7a]">{fileName}</div>
                </div>

                <div>
                  <Label className="block mb-2 text-[#2c3e50]">{t("signup.step4.agreements")}</Label>
                  <Check id="agreeTerms" checked={data.agreeTerms} onChange={(v) => update("agreeTerms", v)} label={t("signup.step4.agreeTerms")} />
                  <Check id="agreeDataUsage" checked={data.agreeDataUsage} onChange={(v) => update("agreeDataUsage", v)} label={t("signup.step4.agreeDataUsage")} />
                </div>

                <div className="flex justify-between pt-2 gap-3">
                  <PrevBtn onClick={prev}>{t("signup.step4.previous")}</PrevBtn>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-md bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold py-3 px-6 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none"
                  >
                    {loading ? t("signup.step4.creatingAccount") : t("signup.step4.createAccount")}
                  </button>
                </div>
              </Section>
            )}
          </form>

          <div className="text-center text-sm text-[#5a6b7a] mt-6">
            {t("signup.alreadyHaveAccount")}{" "}
            <button
              type="button"
              className="text-[#3498db] font-medium hover:underline"
              onClick={() => navigate({ to: "/auth", search: { mode: "login" } })}
            >
              {t("signup.signIn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- helpers -------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-xl font-semibold text-[#2c3e50]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="block mb-2 font-semibold text-[#2c3e50]">{label}</Label>
      {children}
    </div>
  );
}

function Check({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[18px] w-[18px] cursor-pointer accent-[#3498db]"
      />
      <label htmlFor={id} className="text-[15px] cursor-pointer text-[#2c3e50]">{label}</label>
    </div>
  );
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-[#3498db] hover:bg-[#2980b9] text-white font-semibold py-3 px-6 transition-all hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}

function PrevBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-[#95a5a6] hover:bg-[#7f8c8d] text-white font-semibold py-3 px-6 transition-all hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
