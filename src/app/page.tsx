import Link from "next/link";

import { Bell, Bookmark, ChevronRight, Home, Plus, Search, UserRound } from "lucide-react";

import VirtualToletLogo from "@/components/VirtualToletLogo";

const featuredListings = [
  {
    title: "Spacious 3 Bedroom Apartment",
    location: "Block C · Road 8 · Bashundhara R/A",
    rent: "৳35,000 / month",
    details: "3 Bed · 3 Bath · 1,450 sqft",
  },
  {
    title: "Modern Family Apartment",
    location: "Block D · Road 12 · Bashundhara R/A",
    rent: "৳42,000 / month",
    details: "3 Bed · 3 Bath · 1,650 sqft",
  },
  {
    title: "Bright Corner Apartment",
    location: "Block E · Road 4 · Bashundhara R/A",
    rent: "৳30,000 / month",
    details: "2 Bed · 2 Bath · 1,150 sqft",
  },
  {
    title: "Large Family Home",
    location: "Block F · Road 7 · Bashundhara R/A",
    rent: "৳48,000 / month",
    details: "4 Bed · 4 Bath · 1,900 sqft",
  },
];

const verifiedListings = [
  {
    title: "2 Bedroom Apartment",
    location: "Block A · Road 5",
    rent: "৳25,000 / month",
    details: "2 Bed · 2 Bath · 1,000 sqft",
  },
  {
    title: "Family Apartment",
    location: "Block B · Road 9",
    rent: "৳32,000 / month",
    details: "3 Bed · 3 Bath · 1,300 sqft",
  },
  {
    title: "Compact 2 Bedroom",
    location: "Block C · Road 3",
    rent: "৳22,000 / month",
    details: "2 Bed · 2 Bath · 900 sqft",
  },
  {
    title: "Modern 3 Bedroom",
    location: "Block D · Road 6",
    rent: "৳36,000 / month",
    details: "3 Bed · 3 Bath · 1,400 sqft",
  },
];

const activeListings = [
  {
    title: "3 Bedroom Apartment",
    location: "Block D · Road 2",
    rent: "৳38,000 / month",
    details: "3 Bed · 3 Bath · 1,500 sqft",
  },
  {
    title: "2 Bedroom Family Home",
    location: "Block E · Road 11",
    rent: "৳28,000 / month",
    details: "2 Bed · 2 Bath · 1,050 sqft",
  },
  {
    title: "Large 4 Bedroom Apartment",
    location: "Block G · Road 6",
    rent: "৳50,000 / month",
    details: "4 Bed · 4 Bath · 2,000 sqft",
  },
  {
    title: "Bright 3 Bedroom Home",
    location: "Block H · Road 4",
    rent: "৳34,000 / month",
    details: "3 Bed · 3 Bath · 1,350 sqft",
  },
];

const services = [
  ["Electrician", "Electrical work"],
  ["Plumber", "Water & plumbing"],
  ["Cleaning", "Home cleaning"],
  ["Moving", "House shifting"],
  ["Internet", "Internet connection"],
  ["AC Service", "Repair & maintenance"],
];

function ListingCard({ listing, featured = false, verified = false }: { listing: (typeof featuredListings)[number]; featured?: boolean; verified?: boolean }) {
  return (
    <Link href="#" className={["group overflow-hidden rounded-xl border border-border bg-background", "transition-all duration-200", "hover:-translate-y-0.5 hover:border-hover-border hover:shadow-sm", featured ? "w-full" : "w-[280px] shrink-0"].join(" ")}>
      <div className="flex h-40 items-center justify-center bg-surface">
        <Home className="h-7 w-7 text-text-muted" strokeWidth={1.5} />
      </div>

      <div className="p-4">
        <div className="mb-2 min-h-5">{verified && <span className="inline-flex rounded-md bg-brand-green/10 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-brand-green">VERIFIED</span>}</div>

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-text-primary">{listing.title}</h3>

        <p className="mt-1 truncate text-xs text-text-secondary">{listing.location}</p>

        <div className="mt-4">
          <p className="text-sm font-bold text-text-primary">{listing.rent}</p>

          <p className="mt-0.5 truncate text-xs text-text-muted">{listing.details}</p>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>

        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      <Link href="/rentals" className="hidden items-center gap-1 text-sm font-semibold text-brand-green transition-colors hover:text-hover-text sm:flex">
        View all
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, href = "#" }: { icon: typeof Search; title: string; description: string; href?: string }) {
  return (
    <Link href={href} className={["group flex min-h-[76px] items-center gap-3 rounded-xl", "border border-border bg-background p-3", "transition-all duration-200", "hover:border-hover-border hover:bg-hover-background"].join(" ")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 transition-colors group-hover:bg-brand-green/15">
        <Icon className="h-5 w-5 text-brand-green transition-colors group-hover:text-hover-text" strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text-primary transition-colors group-hover:text-hover-text">{title}</span>

        <span className="mt-0.5 block text-xs leading-4 text-text-secondary">{description}</span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-hover-text" />
    </Link>
  );
}

function ServiceItem({ title, description }: { title: string; description: string }) {
  return (
    <Link href="#" className={["group flex min-h-16 items-center gap-3 rounded-lg", "border border-transparent px-2 py-2", "transition-all duration-200", "hover:border-hover-border hover:bg-hover-background"].join(" ")}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 transition-colors group-hover:bg-brand-green/15">
        <Home className="h-4 w-4 text-brand-green transition-colors" strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-hover-text">{title}</span>

        <span className="mt-0.5 block truncate text-xs text-text-secondary">{description}</span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-hover-text" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <VirtualToletLogo />

          <nav className="hidden items-center gap-7 lg:flex">
            <Link href="/rentals" className="rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              Find a Rental
            </Link>

            <Link href="/post-to-let" className="rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              Post a TO-LET
            </Link>

            <Link href="#services" className="rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              Services
            </Link>

            <Link href="#" className="rounded-md px-2 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              Saved
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              ☾
            </button>

            <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-hover-background hover:text-hover-text">
              <Bell className="h-5 w-5" strokeWidth={1.8} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
            </button>

            <Link href="#" aria-label="Profile" className="group flex h-11 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-hover-background">
              <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white transition-colors group-hover:bg-hover-text group-hover:text-background">G</span>

              <span className="hidden xl:block">
                <span className="block max-w-32 truncate text-xs font-semibold text-text-primary transition-colors group-hover:text-hover-text">Gigawashu</span>

                <span className="block text-[10px] text-text-muted transition-colors group-hover:text-hover-text">Profile</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-8 lg:px-10">
        {/* HERO */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-bold tracking-[0.18em] text-brand-green">VIRTUALTOLET</p>

            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-text-primary sm:text-5xl lg:text-[52px]">
              Find a place that
              <br />
              feels like home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary">Discover TO-LETs, check what is actually available, and connect directly with the people behind them.</p>

            <Link href="/rentals" className="group mt-7 flex min-h-16 max-w-2xl items-center gap-3 rounded-xl border border-border bg-background px-5 transition-all duration-200 hover:border-hover-border hover:bg-hover-background">
              <Search className="h-5 w-5 shrink-0 text-brand-green transition-colors group-hover:text-hover-text" strokeWidth={1.8} />

              <span className="flex-1 text-sm font-medium text-text-muted transition-colors group-hover:text-hover-text">Search homes, areas or rent</span>

              <ChevronRight className="h-5 w-5 text-text-muted transition-colors group-hover:text-hover-text" />
            </Link>
          </div>
        </section>

        {/* CONTENT */}
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[220px_minmax(0,1fr)_250px]">
          {/* LEFT ASIDE */}
          <aside>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Quick actions</h2>

              <p className="mt-1 text-sm text-text-secondary">Get things done faster</p>
            </div>

            <div className="space-y-2">
              <QuickAction icon={Search} title="Find a rental" description="Browse homes around you." href="/rentals" />

              <QuickAction icon={Plus} title="Post a TO-LET" description="Share your rental with others." href="/post-to-let" />

              <QuickAction icon={Bookmark} title="Saved listings" description="Keep your favourites close." />

              <QuickAction icon={UserRound} title="My profile" description="Manage your account." />
            </div>
          </aside>

          {/* MAIN */}
          <div className="min-w-0">
            {/* FEATURED */}
            <section className="mb-12">
              <SectionHeader title="Featured TO-LET" description="Listings worth taking a closer look at" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} featured />
                ))}
              </div>
            </section>

            {/* VERIFIED */}
            <section className="mb-12">
              <SectionHeader title="Recently verified" description="Listings with recent verification activity" />

              <div className="hide-scrollbar -mt-2 flex gap-4 overflow-x-auto px-0.5 pb-2 pt-2">
                {verifiedListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} verified />
                ))}
              </div>
            </section>

            {/* ACTIVE */}
            <section className="mb-4">
              <SectionHeader title="Active TO-LET" description="Currently listed rental homes" />

              <div className="hide-scrollbar -mt-2 flex gap-4 overflow-x-auto px-0.5 pb-2 pt-2">
                {activeListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT ASIDE */}
          <aside id="services">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Local services</h2>

              <p className="mt-1 text-sm text-text-secondary">Useful services around your home</p>
            </div>

            <div className="rounded-xl border border-border bg-background p-1">
              {services.map(([title, description]) => (
                <ServiceItem key={title} title={title} description={description} />
              ))}
            </div>
          </aside>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <VirtualToletLogo className="origin-left scale-[0.82]" />

            <span className="text-xs text-text-muted">Find a place. Live better.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              About
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Help
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Privacy
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
