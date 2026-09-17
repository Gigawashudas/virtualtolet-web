"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Bell, Bookmark, Menu, Moon, Search, ShieldCheck, Sun, X } from "lucide-react";

import VirtualToletLogo from "@/components/VirtualToletLogo";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  {
    label: "Find a Rental",
    href: "/rentals",
    icon: Search,
  },
  {
    label: "Post a TO-LET",
    href: "/post-to-let",
    icon: null,
  },
  {
    label: "Services",
    href: "/services",
    icon: null,
  },
  {
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
  },
];

type NavbarProps = {
  adminMode?: boolean;
};

type ProfileData = {
  display_name: string | null;
};

function ThemeToggle() {
  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    const nextIsDark = !isDark;

    document.documentElement.classList.toggle("dark", nextIsDark);

    window.localStorage.setItem("virtualtolet-theme", nextIsDark ? "dark" : "light");
  }

  return (
    <button type="button" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme} className="group flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
      <Moon className="h-5 w-5 dark:hidden" strokeWidth={1.8} />

      <Sun className="hidden h-5 w-5 dark:block" strokeWidth={1.8} />
    </button>
  );
}

export default function Navbar({ adminMode = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileName, setProfileName] = useState("Profile");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle<ProfileData>();

      if (!mounted) {
        return;
      }

      const name = profile?.display_name?.trim() || user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim() || user.email?.split("@")[0]?.trim() || "Profile";

      setProfileName(name);
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const profileInitial = profileName !== "Profile" ? profileName.charAt(0).toUpperCase() : "G";

  return (
    <header className="relative z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <VirtualToletLogo />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {adminMode && (
            <Link href="/admin" className="group flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-bold text-brand-green transition-colors hover:bg-hover-background hover:text-hover-text">
              <ShieldCheck className="h-4 w-4 text-brand-green transition-colors group-hover:text-hover-text" strokeWidth={1.8} />
              Admin Home
            </Link>
          )}

          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="group flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              {Icon && <Icon className="h-4 w-4 text-text-muted transition-colors group-hover:text-hover-text" strokeWidth={1.8} />}

              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />

          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            <Bell className="h-5 w-5" strokeWidth={1.8} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
          </button>

          <Link href="/profile" aria-label="Profile" className="group flex h-11 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-hover-background">
            <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition-colors group-hover:bg-hover-text group-hover:text-background">{profileInitial}</span>

            <span className="hidden xl:block">
              <span className="block max-w-32 truncate text-xs font-semibold text-text-primary transition-colors group-hover:text-hover-text">{profileName}</span>

              <span className="block text-[10px] text-text-muted transition-colors group-hover:text-hover-text">Profile</span>
            </span>
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />

          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            <Bell className="h-5 w-5" strokeWidth={1.8} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
          </button>

          <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto max-w-[1440px] px-6 py-4 sm:px-8">
            <div className="grid gap-1">
              {adminMode && (
                <Link href="/admin" onClick={closeMenu} className="group flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold text-brand-green transition-colors hover:bg-hover-background hover:text-hover-text">
                  <ShieldCheck className="h-5 w-5 text-brand-green transition-colors group-hover:text-hover-text" strokeWidth={1.8} />
                  Admin Home
                </Link>
              )}

              {navLinks.map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} onClick={closeMenu} className="group flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
                  {Icon && <Icon className="h-5 w-5 text-text-muted transition-colors group-hover:text-hover-text" strokeWidth={1.8} />}

                  {label}
                </Link>
              ))}

              <Link href="/profile" onClick={closeMenu} className="group mt-2 flex min-h-12 items-center gap-3 rounded-lg border-t border-border px-3 pt-3 text-sm font-semibold text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition-colors group-hover:bg-hover-text group-hover:text-background">{profileInitial}</span>

                <span>
                  <span className="block text-sm font-bold">{profileName}</span>

                  <span className="block text-xs font-medium text-text-muted group-hover:text-hover-text">Profile</span>
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
