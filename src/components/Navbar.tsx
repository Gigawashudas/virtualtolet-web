"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Ellipsis, Moon, Sun } from "lucide-react";

import VirtualToletLogo from "@/components/VirtualToletLogo";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  display_name: string | null;
};

type BreadcrumbLink = {
  label: string;
  href: string;
};

function ThemeToggle() {
  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    const nextIsDark = !isDark;

    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("virtualtolet-theme", nextIsDark ? "dark" : "light");
  }

  return (
    <button type="button" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme} className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
      <Moon className="h-5 w-5 dark:hidden" strokeWidth={1.8} />
      <Sun className="hidden h-5 w-5 dark:block" strokeWidth={1.8} />
    </button>
  );
}

function getBreadcrumbLinks(pathname: string): BreadcrumbLink[] {
  if (pathname === "/") {
    return [];
  }

  const links: BreadcrumbLink[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  if (pathname === "/rentals") {
    return links;
  }

  if (pathname === "/post-to-let" || pathname.startsWith("/post-to-let/")) {
    return links;
  }

  if (pathname === "/rentals/apartment" || pathname.startsWith("/rentals/apartment/")) {
    links.push({
      label: "Find a Rental",
      href: "/rentals",
    });

    if (pathname !== "/rentals/apartment") {
      links.push({
        label: "Apartment",
        href: "/rentals/apartment",
      });
    }

    return links;
  }

  if (pathname === "/rentals/room" || pathname.startsWith("/rentals/room/")) {
    links.push({
      label: "Find a Rental",
      href: "/rentals",
    });

    if (pathname !== "/rentals/room") {
      links.push({
        label: "Room",
        href: "/rentals/room",
      });
    }

    return links;
  }

  if (pathname === "/rentals/seat" || pathname.startsWith("/rentals/seat/")) {
    links.push({
      label: "Find a Rental",
      href: "/rentals",
    });

    if (pathname !== "/rentals/seat") {
      links.push({
        label: "Seat",
        href: "/rentals/seat",
      });
    }

    return links;
  }

  if (pathname === "/rentals/garage" || pathname.startsWith("/rentals/garage/")) {
    links.push({
      label: "Find a Rental",
      href: "/rentals",
    });

    if (pathname !== "/rentals/garage") {
      links.push({
        label: "Garage",
        href: "/rentals/garage",
      });
    }

    return links;
  }

  if (pathname.startsWith("/rentals/")) {
    links.push({
      label: "Find a Rental",
      href: "/rentals",
    });

    return links;
  }

  return links;
}

function MoreMenu({ breadcrumbLinks, hiddenLinks, isAuthenticated, postToLetHref, profileInitial, profileName }: { breadcrumbLinks: BreadcrumbLink[]; hiddenLinks: BreadcrumbLink[]; isAuthenticated: boolean; postToLetHref: string; profileInitial: string; profileName: string }) {
  const [moreOpen, setMoreOpen] = useState(false);

  function closeMoreMenu() {
    setMoreOpen(false);
  }

  return (
    <div className={["relative shrink-0", "sm:ml-1", hiddenLinks.length === 0 ? "sm:hidden" : ""].join(" ")}>
      <button type="button" aria-label="Open navigation menu" aria-expanded={moreOpen} aria-haspopup="menu" onClick={() => setMoreOpen((current) => !current)} className={["flex h-10 w-10 items-center justify-center", "rounded-lg text-text-primary", "transition-colors", "hover:bg-hover-background hover:text-hover-text", moreOpen ? "bg-hover-background" : ""].join(" ")}>
        <Ellipsis className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {moreOpen && (
        <div role="menu" className="absolute right-0 top-12 z-[100] min-w-[210px] rounded-lg border border-border bg-background p-1.5 shadow-xl sm:left-0 sm:right-auto">
          <Link href={postToLetHref} role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            Post a TO-LET
          </Link>

          <div className="my-1 border-t border-border sm:hidden" />

          <div className="flex items-center justify-between rounded-md px-3 sm:hidden">
            <span className="text-sm font-medium text-text-primary">Theme</span>
            <ThemeToggle />
          </div>

          {isAuthenticated ? (
            <Link href="/profile" role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">{profileInitial}</span>
              <span className="truncate">{profileName}</span>
            </Link>
          ) : (
            <Link href="/sign-in" role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
              Sign In
            </Link>
          )}

          {breadcrumbLinks.length > 0 && (
            <>
              <div className="my-1 border-t border-border sm:hidden" />

              {breadcrumbLinks.map((link) => (
                <Link key={link.href} href={link.href} role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {hiddenLinks.map((link) => (
            <Link key={`desktop-${link.href}`} href={link.href} role="menuitem" onClick={closeMoreMenu} className="hidden min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:flex">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [profileName, setProfileName] = useState("Profile");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navMeasureRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const breadcrumbLinks = getBreadcrumbLinks(pathname);

  useLayoutEffect(() => {
    function calculateVisibleLinks() {
      const container = navContainerRef.current;
      const measure = navMeasureRef.current;

      if (!container || !measure) {
        return;
      }

      const links = Array.from(measure.querySelectorAll<HTMLElement>("[data-breadcrumb-link]"));

      if (links.length === 0) {
        setVisibleCount(0);
        return;
      }

      const containerWidth = container.getBoundingClientRect().width;
      const gap = 4;
      const moreButtonWidth = 44;

      const widths = links.map((link) => link.getBoundingClientRect().width);

      const allLinksWidth = widths.reduce((total, width, index) => total + width + (index > 0 ? gap : 0), 0);

      if (allLinksWidth <= containerWidth) {
        setVisibleCount(links.length);
        return;
      }

      const availableForLinks = Math.max(containerWidth - moreButtonWidth - gap, 0);

      let total = 0;
      let count = 0;

      for (let index = widths.length - 1; index >= 0; index -= 1) {
        const nextWidth = widths[index] + (count > 0 ? gap : 0);

        if (total + nextWidth > availableForLinks) {
          break;
        }

        total += nextWidth;
        count += 1;
      }

      if (count === 0 && links.length > 0) {
        count = 1;
      }

      setVisibleCount(count);
    }

    calculateVisibleLinks();

    const resizeObserver = new ResizeObserver(calculateVisibleLinks);

    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }

    window.addEventListener("resize", calculateVisibleLinks);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateVisibleLinks);
    };
  }, [breadcrumbLinks]);

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && moreMenuRef.current?.contains(target)) {
        return;
      }

      setMoreOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadAuthState() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (!user) {
        setIsAuthenticated(false);
        setProfileName("Profile");
        return;
      }

      setIsAuthenticated(true);

      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle<ProfileData>();

      if (!mounted) {
        return;
      }

      const name = profile?.display_name?.trim() || user.user_metadata?.full_name?.trim() || user.user_metadata?.name?.trim() || user.email?.split("@")[0]?.trim() || "Profile";

      setProfileName(name);
    }

    void loadAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  function closeMoreMenu() {
    setMoreOpen(false);
  }

  const profileInitial = profileName !== "Profile" ? profileName.charAt(0).toUpperCase() : "G";

  const postToLetHref = isAuthenticated ? "/post-to-let" : "/sign-in?redirect=/post-to-let";

  const hiddenCount = Math.max(breadcrumbLinks.length - visibleCount, 0);

  const visibleLinks = hiddenCount > 0 ? breadcrumbLinks.slice(hiddenCount) : breadcrumbLinks;

  const hiddenLinks = hiddenCount > 0 ? breadcrumbLinks.slice(0, hiddenCount) : [];

  return (
    <header className="relative z-50 border-b border-border bg-background">
      <div className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* LEFT — LOGO */}
        <div className="flex shrink-0 items-center justify-start">
          <VirtualToletLogo />
        </div>

        {/* CENTER — NAVIGATION */}
        <div ref={navContainerRef} className="relative min-w-0">
          <div className="flex min-w-0 items-center justify-center">
            {/* DESKTOP — VISIBLE BREADCRUMBS */}
            <nav className="hidden min-w-0 items-center justify-center gap-0.5 overflow-hidden sm:flex">
              {visibleLinks.map((link, index) => (
                <div key={link.href} className="flex min-w-0 shrink-0 items-center">
                  {index > 0 && <ChevronRight className="mx-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.7} />}

                  <Link href={link.href} className={["max-w-[180px] truncate rounded-md px-2 py-2", "text-sm font-bold uppercase tracking-[0.08em]", "text-text-primary", "transition-colors", "hover:bg-hover-background hover:text-hover-text"].join(" ")}>
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>

            {/* 3-DOT MENU
                Mobile: always visible.
                Desktop: visible only when links are hidden.
            */}
            <div ref={moreMenuRef} className={["relative shrink-0", "sm:ml-1", hiddenLinks.length === 0 ? "sm:hidden" : ""].join(" ")}>
              <button type="button" aria-label="Open navigation menu" aria-expanded={moreOpen} aria-haspopup="menu" onClick={() => setMoreOpen((current) => !current)} className={["flex h-10 w-10 items-center justify-center", "rounded-lg text-text-primary", "transition-colors", "hover:bg-hover-background hover:text-hover-text", moreOpen ? "bg-hover-background" : ""].join(" ")}>
                <Ellipsis className="h-5 w-5" strokeWidth={1.8} />
              </button>

              {moreOpen && (
                <div role="menu" className="absolute right-0 top-12 z-[100] min-w-[210px] rounded-lg border border-border bg-background p-1.5 shadow-xl sm:left-0 sm:right-auto">
                  {/* POST TO-LET */}
                  <Link href={postToLetHref} role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
                    Post a TO-LET
                  </Link>

                  {/* MOBILE — THEME */}
                  <div className="my-1 border-t border-border sm:hidden" />

                  <div className="flex items-center justify-between rounded-md px-3 sm:hidden">
                    <span className="text-sm font-medium text-text-primary">Theme</span>
                    <ThemeToggle />
                  </div>

                  {/* MOBILE — PROFILE / SIGN IN */}
                  {isAuthenticated ? (
                    <Link href="/profile" role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">{profileInitial}</span>

                      <span className="truncate">{profileName}</span>
                    </Link>
                  ) : (
                    <Link href="/sign-in" role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
                      Sign In
                    </Link>
                  )}

                  {/* MOBILE — BREADCRUMBS */}
                  {breadcrumbLinks.length > 0 && (
                    <>
                      <div className="my-1 border-t border-border sm:hidden" />

                      {breadcrumbLinks.map((link) => (
                        <Link key={link.href} href={link.href} role="menuitem" onClick={closeMoreMenu} className="flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:hidden">
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}

                  {/* DESKTOP — HIDDEN BREADCRUMBS */}
                  {hiddenLinks.map((link) => (
                    <Link key={`desktop-${link.href}`} href={link.href} role="menuitem" onClick={closeMoreMenu} className="hidden min-h-10 items-center rounded-md px-3 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text sm:flex">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* HIDDEN MEASUREMENT NAVIGATION */}
            <div ref={navMeasureRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -z-50 flex whitespace-nowrap opacity-0">
              {breadcrumbLinks.map((link) => (
                <span key={link.href} data-breadcrumb-link className="px-2 py-2 text-sm font-bold uppercase tracking-[0.08em]">
                  {link.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — DESKTOP ACTIONS */}
        <div className="hidden shrink-0 items-center justify-end gap-1 sm:flex">
          <Link href={postToLetHref} className="flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
            Post a TO-LET
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <Link href="/profile" aria-label="Profile" className="group flex h-11 items-center gap-2 rounded-lg px-1.5 transition-colors">
              <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition-colors group-hover:bg-hover-text group-hover:text-background">{profileInitial}</span>

              <span className="hidden xl:block">
                <span className="block max-w-32 truncate text-xs font-semibold text-text-primary transition-colors group-hover:text-hover-text">{profileName}</span>

                <span className="block text-[10px] text-text-muted transition-colors group-hover:text-hover-text">Profile</span>
              </span>
            </Link>
          ) : (
            <Link href="/sign-in" className="flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-bold text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
