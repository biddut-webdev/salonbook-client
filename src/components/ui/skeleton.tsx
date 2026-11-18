import { cn } from "cn";

/** Simple pulsing placeholder used while data is loading. */
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}
