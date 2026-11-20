
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Appointment = {
  status: "pending" | "confirmed" | "cancelled";
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error("Authentication failed. Please login again.");
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

        setAppointments(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: CalendarDays,
      color: "text-blue-500",
    },
    {
      title: "Pending",
      value: appointments.filter(
        (item) => item.status === "pending"
      ).length,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Confirmed",
      value: appointments.filter(
        (item) => item.status === "confirmed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Cancelled",
      value: appointments.filter(
        (item) => item.status === "cancelled"
      ).length,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here is your appointment summary.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>

            <p className="mt-4 text-3xl font-bold">
              {loading ? "..." : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">
          Welcome to SalonBook
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your appointments and keep track of your salon visits
          from your personal dashboard.
        </p>
      </div>
    </div>
  );
}
