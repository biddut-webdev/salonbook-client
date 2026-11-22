"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Eye,
  Inbox,
  Loader2,
  Scissors,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import StatusBadge from "@/components/dashboard/status-badge";
import type { AppointmentStatus, PaymentStatus } from "@/types";

type Appointment = {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
  service?: {
    serviceName?: string;
    image?: string;
    category?: string;
    duration?: string | number;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={
        status === "paid"
          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 capitalize"
          : "inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize"
      }
    >
      {status}
    </span>
  );
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch the logged-in customer's own appointments.
  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error("Authentication token not found.");
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

        if (active) {
          setAppointments(result.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function handleRetry() {
    setLoading(true);
    setError("");
    setRefreshKey((prev) => prev + 1);
  }

  // Cancel appointment (called from the confirmation dialog).
  async function handleCancel(id: string) {
    setCancelTarget(null);
    try {
      setCancellingId(id);

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel appointment.");
      }

      toast.success("Appointment cancelled successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  // Create a Stripe Checkout Session for a confirmed appointment.
  async function handlePayment(id: string) {
    try {
      setPayingId(id);

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify({ appointmentId: id }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to initialize payment.");
      }

      if (!result.checkoutUrl) {
        throw new Error("Stripe checkout URL not found.");
      }

      // Redirect customer to Stripe Checkout.
      window.location.assign(result.checkoutUrl);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Payment initialization failed.",
      );
      setPayingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 pb-10">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Your bookings</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            My appointments
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track every request, cancel a pending booking and pay once the salon
            confirms.
          </p>
        </div>
        <Button
          className="rounded-full px-5"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          <Scissors className="size-4" />
          Book a service
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full sm:w-auto"
            onClick={handleRetry}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!error && appointments.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Inbox className="size-6" />
          </span>
          <h2 className="font-display mt-4 text-xl font-semibold">
            No appointments yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Your appointment requests will appear here as soon as you book a
            salon service.
          </p>
          <Button
            className="mt-6 rounded-full px-6"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Browse services
          </Button>
        </div>
      )}

      {/* Appointment list */}
      <div className="grid min-w-0 gap-4">
        {appointments.map((appointment) => {
          const canCancel = appointment.status === "pending";
          const canPay =
            appointment.status === "confirmed" &&
            appointment.paymentStatus === "unpaid";

          return (
            <article
              key={appointment._id}
              className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <div className="flex flex-col gap-5 p-5 sm:flex-row">
                {/* Service image */}
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-28 sm:w-36">
                  {appointment.service?.image ? (
                    <Image
                      src={appointment.service.image}
                      alt={appointment.service.serviceName || "Salon service"}
                      fill
                      sizes="(max-width: 640px) 100vw, 144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-primary/40">
                      <Scissors className="size-8" />
                    </div>
                  )}
                </div>

                {/* Appointment information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                        {appointment.service?.category ?? "Salon service"}
                      </p>
                      <h2 className="font-display mt-1 break-words text-xl font-semibold">
                        {appointment.service?.serviceName ?? "Salon Service"}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Requested on{" "}
                        {appointment.createdAt
                          ? formatDate(appointment.createdAt)
                          : "—"}
                      </p>
                    </div>

                    <p className="font-display text-2xl font-semibold text-primary">
                      {formatMoney(Number(appointment.servicePrice))}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4 shrink-0" />
                      {formatDate(appointment.appointmentDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0" />
                      {appointment.timeSlot}
                    </span>
                    {appointment.service?.duration && (
                      <span className="text-xs">
                        {appointment.service.duration} min session
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={appointment.status} />
                    <PaymentBadge status={appointment.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 border-t border-border bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setDetail(appointment)}
                >
                  <Eye className="size-4" />
                  View details
                </Button>

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive hover:text-destructive"
                    disabled={cancellingId === appointment._id}
                    onClick={() => setCancelTarget(appointment._id)}
                  >
                    {cancellingId === appointment._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    Cancel appointment
                  </Button>
                )}

                {canPay && (
                  <Button
                    size="sm"
                    className="rounded-full px-5"
                    disabled={payingId === appointment._id}
                    onClick={() => handlePayment(appointment._id)}
                  >
                    {payingId === appointment._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CreditCard className="size-4" />
                    )}
                    {payingId === appointment._id ? "Redirecting..." : "Pay Now"}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Appointment details dialog */}
      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-soft-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-primary">Appointment details</p>
                <h2 className="font-display mt-1 text-xl font-semibold">
                  {detail.service?.serviceName ?? "Salon service"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Close details"
              >
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="font-medium">
                  {detail.service?.category ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="font-medium">
                  {detail.service?.duration
                    ? `${detail.service.duration} min`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date & time</dt>
                <dd className="font-medium">
                  {formatDate(detail.appointmentDate)} · {detail.timeSlot}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Service price</dt>
                <dd className="font-medium">
                  {formatMoney(Number(detail.servicePrice))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Appointment status
                </dt>
                <dd className="mt-1">
                  <StatusBadge status={detail.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Payment status</dt>
                <dd className="mt-1">
                  <PaymentBadge status={detail.paymentStatus} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Booking request date
                </dt>
                <dd className="font-medium">
                  {detail.createdAt
                    ? new Date(detail.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Your message
                </dt>
                <dd className="mt-1 rounded-xl bg-secondary/60 p-3 text-foreground">
                  {detail.message?.trim() || "No message was provided."}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Appointment reference
                </dt>
                <dd className="mt-1 font-mono text-xs break-all text-muted-foreground">
                  {detail._id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Cancel confirmation dialog (no browser confirm()) */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft-lg">
            <h2 className="font-display text-xl font-semibold">
              Cancel this appointment?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This cannot be undone. The salon will be notified that you no
              longer need this time slot.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setCancelTarget(null)}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                className="rounded-full"
                disabled={cancellingId !== null}
                onClick={() => handleCancel(cancelTarget)}
              >
                {cancellingId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Yes, cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
