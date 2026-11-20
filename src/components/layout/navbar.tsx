
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Scissors, X } from "lucide-react";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/layout/user-menu";
import { cn } from "cn";

// Links visible to everyone.
const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.62_0.13_25)] text-primary-foreground shadow-soft transition-transform group-hover:rotate-6">
        <Scissors className="size-4.5" />
      </span>

      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-tight">
          SalonBook
        </span>
        <span className="mt-0.5 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          Hair · Skin · Spa
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);

  // A link gets the "active" style when it matches the current page.
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function renderLinks(className?: string) {
    return publicLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive(link.href)
            ? "bg-secondary text-primary"
            : "text-foreground/80 hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        {link.label}
      </Link>
    ));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {renderLinks()}
        </nav>

        {/* Desktop: user menu or sign in / sign up */}
        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button
                variant="ghost"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign In
              </Button>

              <Button
                className="rounded-full px-5 shadow-soft"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Book Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile: hamburger button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">{renderLinks()}</nav>

          <div className="mt-3 border-t border-border pt-3">
            {user ? (
              <div className="flex flex-col gap-1">
                <p className="truncate px-3 py-2 text-sm font-semibold">
                  {user.name}
                </p>

                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Dashboard
                </Link>

                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false);
                    authClient.signOut();
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Button>

                <Button
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
