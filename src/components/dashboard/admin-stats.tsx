
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Scissors,
  CalendarDays,
  Clock,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type DashboardStats = {
  totalCustomers: number;
  totalServices: number;
  totalAppointments: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  totalSuccessfulPayments: number;
  revenue: number;
};

const AdminStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await authClient.token();
        const token = result.data?.token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load dashboard statistics.");
        }

        setStats(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers,
      icon: Users,
    },
    {
      title: "Active Services",
      value: stats?.totalServices,
      icon: Scissors,
    },
    {
      title: "Total Appointments",
      value: stats?.totalAppointments,
      icon: CalendarDays,
    },
    {
      title: "Pending Appointments",
      value: stats?.statusCounts.pending,
      icon: Clock,
    },
    {
      title: "Confirmed Appointments",
      value: stats?.statusCounts.confirmed,
      icon: CheckCircle2,
    },
    {
      title: "Successful Payments",
      value: stats?.totalSuccessfulPayments,
      icon: CreditCard,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="h-32 animate-pulse rounded-2xl bg-secondary"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        Failed to load dashboard statistics: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>

              <div className="rounded-xl bg-secondary p-3 text-primary">
                <Icon size={21} />
              </div>
            </div>

            <h3 className="mt-5 text-3xl font-bold text-foreground">
              {card.value ?? 0}
            </h3>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
