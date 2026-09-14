"use client";

import Link from "next/link";
import { Bell, Bookmark, Search, UserRound } from "lucide-react";

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

export default function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
        {/* Logo */}
        <VirtualToletLogo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="group flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              {Icon && <Icon className="h-4 w-4 text-text-muted transition-colors group-hover:text-hover-text" strokeWidth={1.8} />}

              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Theme */}
          <button type="button" aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            ☾
          </button>

          {/* Notifications */}
          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            <Bell className="h-5 w-5" strokeWidth={1.8} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
          </button>

          {/* Profile */}
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
