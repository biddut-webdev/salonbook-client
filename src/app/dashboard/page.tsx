
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const stats = [
  {
    title: "Total Appointments",
    value: "0",
    icon: CalendarDays,
    color: "text-blue-500",
  },
  {
    title: "Pending",
    value: "0",
    icon: Clock,
    color: "text-yellow-500",
  },
  {
    title: "Confirmed",
    value: "0",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  {
    title: "Cancelled",
    value: "0",
    icon: XCircle,
    color: "text-red-500",
  },
];

export default function DashboardPage() {
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
              {stat.value}
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
