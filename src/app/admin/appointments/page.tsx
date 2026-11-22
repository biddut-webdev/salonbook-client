
"use client";

import { useEffect, useState } from "react";
import { Search, CalendarDays, RefreshCw, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

type Appointment = {
  _id: string;
  serviceId: string;
  customerId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "paid" | "unpaid";
  status: AppointmentStatus;
  createdAt: string;
  service?: {
    serviceName?: string;
    image?: string;
    category?: string;
    duration?: string | number;
  };
  customer?: {
    name?: string;
    email?: string;
    image?: string;
  };
};

const allStatuses: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const allowedTransitions: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [error, setError] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setError("");

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (dateFilter) {
        params.set("date", dateFilter);
      }

      const response = await fetch(
        `${API_URL}/api/appointments?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

      setAppointments(result.data || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Load appointments when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 300);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, dateFilter]);

  // Update appointment status
  const handleStatusChange = async (
    id: string,
    status: AppointmentStatus
  ) => {
    try {
      setUpdatingId(id);

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update appointment status."
        );
      }

      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status }
            : appointment
        )
      );

      toast.success("Appointment status updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <p className="eyebrow text-primary">Bookings</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Manage appointments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review requests, confirm pending bookings and cancel when needed.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />

          <input
            type="text"
            placeholder="Search customer or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>

          {allStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <div className="relative">
          <CalendarDays
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Appointment Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">
              All Appointments
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {appointments.length} appointments found
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchAppointments();
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchAppointments();
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-foreground/80">
              No appointments found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Customer
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Service
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Date & Time
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Price
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Payment
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Appointment Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {appointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="transition hover:bg-secondary"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">
                        {appointment.customer?.name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {appointment.customer?.email || "No email"}
                      </p>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">
                        {appointment.service?.serviceName ||
                          "Service unavailable"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {appointment.service?.category || ""}
                      </p>
                    </td>

                    {/* Date and Time */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {appointment.timeSlot}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-medium text-foreground">
                      ${appointment.servicePrice}
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${appointment.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {appointment.paymentStatus}
                      </span>
                    </td>

                    {/* Appointment Status */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[appointment.status]}`}
                        >
                          {appointment.status}
                        </span>

                        {allowedTransitions[appointment.status].length >
                          0 && (
                            <select
                              value={appointment.status}
                              disabled={updatingId === appointment._id}
                              onChange={(e) =>
                                handleStatusChange(
                                  appointment._id,
                                  e.target.value as AppointmentStatus
                                )
                              }
                              className="rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-primary disabled:opacity-50"
                            >
                              <option value={appointment.status}>
                                Current: {appointment.status}
                              </option>

                              {allowedTransitions[
                                appointment.status
                              ].map((status) => (
                                <option key={status} value={status}>
                                  Change to: {status}
                                </option>
                              ))}
                            </select>
                          )}

                        <button
                          type="button"
                          onClick={() => setDetail(appointment)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Eye className="size-3.5" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Appointment details dialog */}
        {detail && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-soft-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-primary">Appointment details</p>
                  <h2 className="font-display mt-1 text-xl font-semibold">
                    {detail.service?.serviceName ?? "Service unavailable"}
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
                  <dt className="text-xs text-muted-foreground">Customer</dt>
                  <dd className="font-medium">{detail.customer?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="truncate font-medium">
                    {detail.customer?.email ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="font-medium">{detail.service?.category ?? "—"}</dd>
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
                  <dd className="font-medium">${detail.servicePrice}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Appointment status</dt>
                  <dd className="mt-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[detail.status]}`}
                    >
                      {detail.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Payment status</dt>
                  <dd className="mt-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${detail.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {detail.paymentStatus}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Requested on</dt>
                  <dd className="font-medium">
                    {new Date(detail.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    Customer message
                  </dt>
                  <dd className="mt-1 rounded-xl bg-secondary/60 p-3 text-foreground">
                    {detail.message?.trim() || "No message was provided."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
