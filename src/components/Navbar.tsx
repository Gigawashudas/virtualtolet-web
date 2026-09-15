"use client";

import Link from "next/link";

import { Bell, Bookmark, Moon, Search, ShieldCheck, Sun } from "lucide-react";

import VirtualToletLogo from "@/components/VirtualToletLogo";

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
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <VirtualToletLogo />

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

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            <Bell className="h-5 w-5" strokeWidth={1.8} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
          </button>

          <Link href="/profile" aria-label="Profile" className="group flex h-11 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-hover-background">
            <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition-colors group-hover:bg-hover-text group-hover:text-background">G</span>

            <span className="hidden xl:block">
              <span className="block max-w-32 truncate text-xs font-semibold text-text-primary transition-colors group-hover:text-hover-text">Gigawashu</span>

              <span className="block text-[10px] text-text-muted transition-colors group-hover:text-hover-text">Profile</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
