
"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Loader2, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Appointment = {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  service?: {
    serviceName: string;
    image?: string;
    duration?: string | number;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch appointments
  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${API_URL}/api/appointments/mine`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load appointments."
          );
        }

        if (active) {
          setAppointments(result.data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
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

  // Retry loading
  function handleRetry() {
    setLoading(true);
    setError("");
    setRefreshKey((prev) => prev + 1);
  }

  // Cancel appointment
  async function handleCancel(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/appointments/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to cancel appointment."
        );
      }

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // Status styles
  function getStatusStyle(status: Appointment["status"]) {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Appointments
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your salon appointments.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-sm text-destructive">
            {error}
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleRetry}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!error && appointments.length === 0 && (
        <div className="rounded-xl border bg-card px-4 py-12 text-center sm:px-6">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">
            No appointments yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Your appointments will appear here when you book a service.
          </p>
        </div>
      )}

      {/* Appointment List */}
      <div className="grid min-w-0 gap-4">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
          >
            <div className="flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-start">
              {/* Appointment Information */}
              <div className="min-w-0 space-y-3">
                <div>
                  <h2 className="break-words text-lg font-semibold">
                    {appointment.service?.serviceName || "Salon Service"}
                  </h2>

                  <p className="mt-1 break-all text-xs text-muted-foreground sm:text-sm">
                    Appointment ID: {appointment._id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    {new Date(
                      appointment.appointmentDate
                    ).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    {appointment.timeSlot}
                  </span>
                </div>

                {/* Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                    Payment: {appointment.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex flex-row items-center justify-between gap-3 border-t pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <p className="text-xl font-bold">
                  ${appointment.servicePrice}
                </p>

                {appointment.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="max-w-full text-destructive hover:text-destructive"
                    disabled={cancellingId === appointment._id}
                    onClick={() => handleCancel(appointment._id)}
                  >
                    {cancellingId === appointment._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}

                    Cancel Appointment
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
