"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { createAppointment } from "@/lib/api";
import { TIME_SLOTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import type { Service } from "@/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/**
 * Right-hand booking card on the service details page.
 * Handles: session loading, sign-in redirect, admin restriction and the form.
 */
export default function AppointmentPanel({ service }: { service: Service }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  // This is a protected page: visitors who are not signed in go to /sign-in.
  useEffect(() => {
    if (!isPending && !user) {
      router.replace(
        `/sign-in?next=${encodeURIComponent(`/services/${service._id}`)}`,
      );
    }
  }, [isPending, user, router, service._id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!date) {
      toast.error("Please choose an appointment date.");
      return;
    }

    // Ask Better Auth for a short-lived JWT for the Express API.
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      toast.error("Your session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      await createAppointment(data.token, {
        serviceId: service._id,
        appointmentDate: date,
        timeSlot,
        message,
      });

      toast.success("Appointment request sent! The salon will confirm it soon.");
      setBooked(true);
      setDate("");
      setMessage("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not book the service.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  // Admins manage appointments, they never book as customers.
  if (user.role === "admin") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Admin account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Admins cannot submit appointment requests. Sign in with a customer
          account to book this service.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Book an Appointment</h2>
        <span className="text-lg font-bold text-primary">
          ${service.price}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <Clock className="mr-1 inline size-3.5" />
        {service.duration} minutes · Pending until the salon confirms
      </p>

      {booked && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <CalendarCheck className="mt-0.5 size-4 shrink-0" />
          <span>
            Request sent! You can track its status from your dashboard.
          </span>
        </div>
      )}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="appointment-date" className="text-sm font-medium">
            Appointment date
          </label>
          <input
            id="appointment-date"
            type="date"
            className={inputClass}
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="time-slot" className="text-sm font-medium">
            Available time slot
          </label>
          <select
            id="time-slot"
            className={inputClass}
            value={timeSlot}
            onChange={(event) => setTimeSlot(event.target.value)}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium">
            Additional message <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="message"
            className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            placeholder="Any preference or note for the stylist..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending request..." : "Request Appointment"}
        </Button>
      </form>
    </div>
  );
}
