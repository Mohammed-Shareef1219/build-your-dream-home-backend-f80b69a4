import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProfilePanel } from "@/components/ProfilePanel";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  const { t } = useTranslation("misc");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{t("notFound.code")}</h1>
        <h2 className="mt-4 text-xl font-semibold">{t("notFound.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFound.description")}</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BuildYourHome — Design & Discover Your Dream Home" },
      {
        name: "description",
        content:
          "Your digital real-estate broker. Browse villas, apartments, duplexes and more. Free consultations and AI-powered home design.",
      },
      { property: "og:title", content: "BuildYourHome — Design & Discover Your Dream Home" },
      { name: "twitter:title", content: "BuildYourHome — Design & Discover Your Dream Home" },
      { name: "description", content: "Real estate website to showcase properties for sale, acting as a digital broker." },
      { property: "og:description", content: "Real estate website to showcase properties for sale, acting as a digital broker." },
      { name: "twitter:description", content: "Real estate website to showcase properties for sale, acting as a digital broker." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/303e8f0f-0359-4d81-a083-2eff839445d8/id-preview-ad537adb--c2afe350-4d6a-4cde-a158-1695a0027220.lovable.app-1778929329184.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/303e8f0f-0359-4d81-a083-2eff839445d8/id-preview-ad537adb--c2afe350-4d6a-4cde-a158-1695a0027220.lovable.app-1778929329184.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Dancing+Script:wght@600;700&family=Cairo:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
          <ProfilePanel />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
