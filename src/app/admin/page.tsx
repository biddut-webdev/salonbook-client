
import Link from "next/link";
import {
  CalendarDays,
  Scissors,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AdminStats from "@/components/dashboard/admin-stats";

const stats = [
  {
    title: "Total Appointments",
    value: "—",
    description: "All appointments",
    icon: CalendarDays,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Total Services",
    value: "—",
    description: "Available services",
    icon: Scissors,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Total Customers",
    value: "—",
    description: "Registered customers",
    icon: Users,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Total Revenue",
    value: "—",
    description: "From transactions",
    icon: CreditCard,
    color: "bg-orange-500/10 text-orange-600",
  },
];

const quickActions = [
  {
    title: "Add New Service",
    description: "Create a salon service",
    href: "/admin/services/new",
    icon: Plus,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Manage Appointments",
    description: "Review customer bookings",
    href: "/admin/appointments",
    icon: CalendarDays,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Manage Customers",
    description: "View registered users",
    href: "/admin/users",
    icon: Users,
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 pb-10">

      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171717] via-[#292524] to-[#44403c] p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-24 right-32 size-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
              <Sparkles className="size-3.5 text-amber-300" />
              SalonBook Administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome to your Dashboard
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
              Manage your salon, monitor appointments, and keep everything
              running smoothly from one place.
            </p>
          </div>

          <Link
            href="/admin/services/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-amber-100"
          >
            <Plus className="size-4" />
            Add New Service
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Section Heading */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is a summary of your salon performance.
          </p>
        </div>

        {/* Statistics Cards */}
        <AdminStats />

      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quickly access your most-used tools.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${action.color}`}
              >
                <action.icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>

              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold tracking-tight">
              Recent Activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep track of what is happening in your salon.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-4" />
            Latest updates
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <TrendingUp className="size-6 text-muted-foreground" />
          </div>

          <h3 className="mt-4 font-semibold">
            No recent activity yet
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            New appointments, customer registrations, and transactions
            will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
