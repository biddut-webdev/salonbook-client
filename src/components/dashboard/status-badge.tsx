import { cn } from "cn";
import { STATUS_STYLES } from "@/lib/format";
import type { AppointmentStatus, PaymentStatus } from "@/types";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export default function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus | PaymentStatus;
  className?: string;
}) {
  const style =
    status === "paid" || status === "unpaid"
      ? PAYMENT_STYLES[status]
      : STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}