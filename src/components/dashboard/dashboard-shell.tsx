"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Scissors,
  ShieldCheck,
  User,
  Users,
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
  // Customer Dashboard
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["customer"],
  },
  {
    href: "/dashboard/appointments",
    label: "My Appointments",
    icon: CalendarDays,
    roles: ["customer"],
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: User,
    roles: ["customer"],
  },

  // Admin Dashboard
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    href: "/admin/services",
    label: "Manage Services",
    icon: Scissors,
    roles: ["admin"],
  },
  {
    href: "/admin/services/new",
    label: "Add/Update Service",
    icon: PlusCircle,
    roles: ["admin"],
  },
  {
    href: "/admin/appointments",
    label: "Manage Appointments",
    icon: CalendarDays,
    roles: ["admin"],
  },
  {
    href: "/admin/users",
    label: "Manage Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/admin/transactions",
    label: "Transactions",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    href: "/admin/profile",
    label: "My Profile",
    icon: User,
    roles: ["admin"],
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

  // Overview pages must match exactly, otherwise /admin would also be
  // "active" while the admin is on /admin/services.
  function isActive(href: string) {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/75 hover:bg-secondary hover:text-foreground",
            )}
          >
            <link.icon
              className={cn("size-4", active ? "" : "text-muted-foreground")}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {role === "admin" ? "Admin panel" : "My account"}
              </p>
              <p className="font-display mt-1.5 truncate text-lg font-semibold">
                {user.name}
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  role === "admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {role === "admin" ? (
                  <>
                    <ShieldCheck className="size-3" /> Administrator
                  </>
                ) : (
                  "Customer"
                )}
              </span>
            </div>

            {nav}

            <div className="space-y-1 border-t border-border pt-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to site
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                {role === "admin" ? "Admin panel" : "My account"}
              </p>
              <p className="truncate text-sm font-semibold">{user.name}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>

          {mobileOpen && (
            <div className="mb-4 space-y-1 rounded-2xl border border-border bg-card p-2 shadow-soft lg:hidden">
              {nav}
              <div className="mt-1 border-t border-border pt-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
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
