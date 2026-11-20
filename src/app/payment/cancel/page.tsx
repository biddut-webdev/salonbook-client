import Link from "next/link";
import { XCircle, CalendarDays, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-soft-lg sm:p-9">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
          <XCircle className="size-11 text-destructive" />
        </div>

        <p className="eyebrow mt-6 text-primary">Checkout cancelled</p>
        <h1 className="font-display mt-2 text-3xl font-semibold">
          Payment was not completed
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Nothing was charged. Your appointment is still available if it remains
          confirmed — you can try paying again anytime.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4 text-left">
          <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            No successful payment was confirmed, so your appointment is still
            marked as <span className="font-semibold text-foreground">unpaid</span>.
          </p>
        </div>

        <Button
          className="mt-6 w-full rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/appointments" />}
        >
          <CalendarDays className="size-4" />
          Back to My Appointments
        </Button>

        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-muted-foreground hover:text-primary"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
