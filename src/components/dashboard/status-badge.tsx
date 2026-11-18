import { cn } from "cn";
import { STATUS_STYLES } from "@/lib/format";
import type { AppointmentStatus } from "@/types";

/** Small coloured pill: pending / confirmed / completed / cancelled. */
export default function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
