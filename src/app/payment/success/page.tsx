import Link from "next/link";
import { CheckCircle2, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 text-center shadow-soft-lg sm:p-9">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-11 text-emerald-600" />
        </div>

        <p className="eyebrow mt-6 text-primary">Payment received</p>
        <h1 className="font-display mt-2 text-3xl font-semibold">
          Thank you for your payment
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Stripe has brought you back to SalonBook. We are now verifying the
          payment with our secure webhook.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4 text-left">
          <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Payment verification</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your appointment payment status changes to{" "}
              <span className="font-semibold text-foreground">paid</span> only
              after Stripe confirms the payment through the verified webhook.
              This usually takes a few seconds.
            </p>
          </div>
        </div>

        <Button
          className="mt-6 w-full rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/appointments" />}
        >
          <CalendarDays className="size-4" />
          View My Appointments
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
