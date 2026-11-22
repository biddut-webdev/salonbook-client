"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Scissors,
  Sparkles,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import StatCard from "@/components/dashboard/stat-card";
import Skeleton from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Appointment = {
  status: "pending" | "confirmed" | "cancelled";
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  useEffect(() => {
    let active = true;

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError("");

        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error("Authentication failed. Please login again.");
        }

        const response = await fetch(`${API_URL}/api/appointments/mine`, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load appointments.");
        }

        if (active) setAppointments(result.data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAppointments();

    return () => {
      active = false;
    };
  }, []);

  const counts = {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "pending").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
  };

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
              Customer dashboard
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              Here is a quick look at your salon bookings. Request a new
              appointment or pay for a confirmed one whenever you are ready.
            </p>
          </div>

          <Button
            className="shrink-0 rounded-full bg-white px-5 text-primary hover:bg-gold hover:text-gold-foreground"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            <Scissors className="size-4" />
            Book a service
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Appointment summary
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Counts update automatically after every booking or cancellation.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total requests"
              value={counts.total}
              icon={CalendarDays}
              hint="Every appointment request"
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              icon={Clock}
              hint="Waiting for salon confirmation"
            />
            <StatCard
              label="Confirmed"
              value={counts.confirmed}
              icon={CheckCircle2}
              hint="Ready to pay or visit"
            />
            <StatCard
              label="Cancelled"
              value={counts.cancelled}
              icon={XCircle}
              hint="No longer active"
            />
          </div>
        )}
      </section>

      {/* Shortcut card */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/appointments"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <CalendarDays className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">My appointments</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              View details, cancel pending requests and pay confirmed bookings.
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
        </Link>

        <Link
          href="/services"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Scissors className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">Explore services</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse haircuts, colouring, facials, manicures and spa treatments.
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
        </Link>
      </section>
    </div>
  );
}
