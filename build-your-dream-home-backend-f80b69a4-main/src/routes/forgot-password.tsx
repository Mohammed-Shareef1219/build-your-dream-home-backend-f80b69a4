import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trans, useTranslation } from "react-i18next";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — BuildYourHome" },
      { name: "description", content: "Reset your BuildYourHome account password." },
      { property: "og:title", content: "Forgot Password — BuildYourHome" },
      { property: "og:description", content: "Reset your BuildYourHome account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const useSchema = () => {
  const { t } = useTranslation("auth");
  return z.object({
    email: z.string().trim().email(t("forgotPassword.validation.invalidEmail")).max(255),
  });
};

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const schema = useSchema();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success(t("forgotPassword.toast.sent"));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')" }}>
      <div className="w-[420px] max-w-[92%] rounded-xl bg-white/95 backdrop-blur-md border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.15)] p-8">
        <h1 className="mb-2 text-[26px] font-semibold text-[#2d3748] text-center">{t("forgotPassword.title")}</h1>
        <p className="mb-6 text-sm text-[#4a5568] text-center">
          {t("forgotPassword.subtitle")}
        </p>

        {sent ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 text-center">
            <Trans i18nKey="forgotPassword.sentMessage" ns="auth" values={{ email }} components={{ strong: <strong /> }} />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#4a5568]">{t("forgotPassword.emailLabel")}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[15px] focus:border-[#4299e1] focus:outline-none focus:ring-[3px] focus:ring-[#4299e1]/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#4299e1] px-4 py-3.5 text-base font-medium text-white shadow transition-all hover:bg-[#3182ce] disabled:opacity-50"
            >
              {loading ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-[#4a5568]">
          {t("forgotPassword.rememberedIt")}{" "}
          <Link to="/auth" search={{ mode: "login" }} className="font-medium text-[#4299e1] hover:underline">
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
