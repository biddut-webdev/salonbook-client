
import Link from "next/link";
import { CheckCircle2, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-11 text-green-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Payment Submitted!
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Thank you for your payment. Stripe has redirected you
          back to SalonBook. We are verifying your payment.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted p-4 text-left">
          <Clock className="mt-0.5 size-5 shrink-0 text-primary" />

          <div>
            <p className="text-sm font-semibold">
              Payment Verification
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your appointment payment status will update after
              Stripe confirms the payment through our secure webhook.
            </p>
          </div>
        </div>

        <Link href="/dashboard/appointments" className="block">
          <Button className="mt-6 w-full">
            <CalendarDays className="mr-2 size-4" />
            View My Appointments
          </Button>
        </Link>
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
