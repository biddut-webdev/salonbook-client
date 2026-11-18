import type { AppointmentStatus } from "@/types";

/** Appointment dates are stored as UTC midnight, so always format them in UTC. */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Tailwind classes for each appointment status pill.
export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};
