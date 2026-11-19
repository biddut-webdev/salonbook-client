
import Link from "next/link";
import { XCircle, CalendarDays, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="size-11 text-red-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your payment was not completed. Don&apos;t worry, your
          appointment is still available if it remains confirmed.
          You can try paying again anytime.
        </p>

        <div className="mt-6 rounded-xl bg-muted p-4 text-left">
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-primary" />
            <p className="text-sm font-medium">
              No successful payment was confirmed.
            </p>
          </div>
        </div>

        <Link href="/dashboard/appointments" className="block">
          <Button className="mt-6 w-full">
            <CalendarDays className="mr-2 size-4" />
            Back to My Appointments
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
