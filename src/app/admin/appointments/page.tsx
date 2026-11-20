
"use client";

import { useEffect, useState } from "react";
import { Search, CalendarDays, RefreshCw } from "lucide-react";
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
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manage Appointments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all customer appointments.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-3">
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
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
