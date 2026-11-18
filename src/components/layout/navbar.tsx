"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
    <Link href="/" className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Scissors className="size-4" />
      </span>
      <span className="text-lg font-bold tracking-tight">SalonBook</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu whenever the page (route) changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // A link gets the "active" style when it matches the current page.
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function renderLinks(className?: string) {
    return publicLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          isActive(link.href) ? "text-primary" : "text-foreground",
          className,
        )}
      >
        {link.label}
      </Link>
    ));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {renderLinks()}
        </nav>

        {/* Desktop: user menu or sign in / sign up */}
        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            // Skeleton while the session is being checked — avoids a wrong flash.
            <div className="size-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign In
              </Button>
              <Button nativeButton={false} render={<Link href="/sign-up" />}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile: hamburger button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile menu (only rendered when open) */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">{renderLinks()}</nav>

          <div className="mt-3 border-t border-border pt-3">
            {user ? (
              <div className="flex flex-col gap-1">
                <p className="truncate px-3 py-2 text-sm font-semibold">
                  {user.name}
                </p>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => authClient.signOut()}
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
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
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
