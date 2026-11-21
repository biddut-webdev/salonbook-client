"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/dashboard/status-badge";
import Skeleton from "@/components/ui/skeleton";
import type { AppointmentStatus, PaymentStatus } from "@/types";

type RecentAppointment = {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  servicePrice?: number;
  customer?: { name?: string; email?: string };
  service?: { serviceName?: string; category?: string };
};

/**
 * "Recent activity" panel on the admin overview: the five newest appointment
 * requests, straight from the stats endpoint (admin-only, JWT protected).
 */
export default function RecentAppointments() {
  const [items, setItems] = useState<RecentAppointment[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data } = await authClient.token();
        if (!data?.token) throw new Error("Authentication token not found.");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/stats`,
          { headers: { Authorization: `Bearer ${data.token}` }, cache: "no-store" },
        );
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.message || "Could not load recent activity.");
        }
        if (active) setItems(body.data.recentAppointments ?? []);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The latest appointment requests in your salon.
          </p>
        </div>
        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Manage appointments
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {error ? (
        <p className="p-6 text-sm text-destructive">{error}</p>
      ) : !items ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold">No appointments yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            New appointment requests will appear here as soon as customers book
            a service.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {item.service?.serviceName ?? "Service removed"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.customer?.name ?? "Customer"} ·{" "}
                  {item.customer?.email ?? "—"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(item.appointmentDate)} · {item.timeSlot}
                </span>
                <StatusBadge status={item.status} />
                <span
                  className={
                    item.paymentStatus === "paid"
                      ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800 capitalize"
                      : "inline-flex rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground capitalize"
                  }
                >
                  {item.paymentStatus}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
