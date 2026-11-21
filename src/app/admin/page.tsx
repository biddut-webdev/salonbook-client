import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import AdminStats from "@/components/dashboard/admin-stats";
import RecentAppointments from "@/components/dashboard/recent-appointments";

const quickActions = [
  {
    title: "Add New Service",
    description: "Create a salon service",
    href: "/admin/services/new",
    icon: Plus,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Manage Appointments",
    description: "Review customer bookings",
    href: "/admin/appointments",
    icon: CalendarDays,
    color: "bg-gold/20 text-gold-foreground",
  },
  {
    title: "Manage Customers",
    description: "View registered users",
    href: "/admin/users",
    icon: Users,
    color: "bg-emerald-500/10 text-emerald-700",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[oklch(0.24_0.05_350)] p-6 text-white shadow-soft-lg sm:p-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,oklch(0.55_0.15_5/50%),transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute -right-20 -bottom-24 size-64 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
              <Sparkles className="size-3.5 text-gold" />
              SalonBook Administration
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome to your dashboard
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              Manage your salon, monitor appointments, and keep everything
              running smoothly from one place.
            </p>
          </div>

          <Link
            href="/admin/services/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-soft transition hover:bg-gold hover:text-gold-foreground"
          >
            <Plus className="size-4" />
            Add New Service
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Dashboard overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A summary of your salon performance.
          </p>
        </div>

        <AdminStats />
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight to the tools you use most.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
            >
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${action.color}`}
              >
                <action.icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{action.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>

              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity (latest 5 appointment requests) */}
      <RecentAppointments />
    </div>
  );
}
