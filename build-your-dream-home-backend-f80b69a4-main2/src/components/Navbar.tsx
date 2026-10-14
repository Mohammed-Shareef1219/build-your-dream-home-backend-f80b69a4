import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, User, LogOut, LayoutDashboard, Heart, Sun, Moon, Languages, UserCog } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", key: "home" },
  { to: "/property-types", key: "propertyTypes" },
  { to: "/gallery", key: "designGallery" },
  { to: "/properties", key: "listings" },
  { to: "/consultation", key: "freeConsultation" },
] as const;

export function Navbar() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt="BuildYourHome logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-2xl font-bold tracking-tight">
            {t("brand")}
          </span>
        </Link>


        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-secondary relative ${
                  active ? "text-secondary" : "text-foreground/80"
                }`}
              >
                {t(`nav.${l.key}`)}
                {active && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-secondary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="font-semibold text-xs px-2" aria-label={t("language.toggle")}>
            <Languages className="h-4 w-4" /> {lang === "en" ? "AR" : "EN"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("nav.toggleTheme")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.email}</div>
                  {isAdmin && (
                    <div className="text-xs text-secondary font-semibold mt-0.5">{t("nav.administrator")}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCog className="mr-2 h-4 w-4" /> {t("nav.profileSettings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    <Heart className="mr-2 h-4 w-4" /> {t("nav.favorites")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.adminDashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button variant="brand" size="sm" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("nav.signup")}
                </Link>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("nav.toggleMenu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              >
                {t(`nav.${l.key}`)}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-3 border-t border-border/40 mt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/auth">{t("nav.login")}</Link>
                </Button>
                <Button variant="brand" size="sm" className="flex-1" asChild>
                  <Link to="/auth" search={{ mode: "signup" }}>
                    {t("nav.signup")}
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
