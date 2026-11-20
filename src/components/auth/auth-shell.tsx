import Link from "next/link";
import { Check, Scissors } from "lucide-react";

const perks = [
  "Book any service in under a minute",
  "Track pending, confirmed and cancelled requests",
  "Pay securely with Stripe after confirmation",
];

/**
 * Shared frame for the Sign In / Sign Up pages.
 * Large screens get a brand panel on the left, the form card on the right.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden rounded-[2rem] bg-[oklch(0.24_0.05_350)] p-10 text-white shadow-soft-lg lg:block">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,oklch(0.55_0.15_5/45%),transparent_55%)]"
          aria-hidden
        />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Scissors className="size-4" />
            </span>
            <span className="font-display text-xl font-semibold">SalonBook</span>
          </Link>

          <h2 className="font-display mt-14 max-w-sm text-4xl leading-tight font-semibold">
            Your seat is waiting,
            <span className="block italic text-gold">beautiful.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Join thousands of clients who book their haircuts, facials and spa
            days online — without a single phone call.
          </p>

          <ul className="mt-10 space-y-3 text-sm">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-white/85">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                  <Check className="size-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form card */}
      <div className="w-full max-w-md justify-self-center rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="text-center">
          <p className="eyebrow text-primary">SalonBook account</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
