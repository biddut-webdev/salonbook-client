"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Array<"customer" | "admin">;
};

// Sidebar entries. A link only shows up for the roles listed here.
const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["customer", "admin"],
  },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarDays,
    roles: ["customer", "admin"],
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
    roles: ["customer", "admin"],
  },
];

export default function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user.role === "admin" ? "admin" : "customer";
  const links = NAV_LINKS.filter((link) => link.roles.includes(role));

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            isActive(link.href)
              ? "bg-primary/10 text-primary"
              : "text-foreground",
          )}
        >
          <link.icon className="size-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {role === "admin" ? "Admin panel" : "My account"}
              </p>
              <p className="mt-1 truncate text-sm font-semibold">{user.name}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                {role === "admin" ? (
                  <>
                    <ShieldCheck className="size-3" /> Administrator
                  </>
                ) : (
                  "Customer"
                )}
              </p>
            </div>

            {nav}

            <div className="space-y-1 border-t border-border pt-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to site
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0">
          {/* Mobile header with menu toggle */}
          <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase">
                {role === "admin" ? "Admin panel" : "My account"}
              </p>
              <p className="truncate text-sm font-semibold">{user.name}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>

          {mobileOpen && (
            <div className="mb-4 space-y-1 rounded-xl border border-border bg-card p-2 lg:hidden">
              {nav}
              <div className="mt-1 border-t border-border pt-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
