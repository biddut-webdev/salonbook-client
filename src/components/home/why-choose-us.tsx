import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Expert Stylists",
    description:
      "Our team has years of experience with haircuts, colouring, skincare and spa treatments.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Online Booking",
    description:
      "Pick your service, date and time slot in seconds — no phone calls, no waiting in line.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Pay safely with Stripe only after the salon confirms your appointment request.",
  },
];

/**
 * Extra home page section (our own idea, as required).
 */
export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-secondary/40">
      <div className="bg-dotted absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-primary">Why SalonBook</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A calmer way to book your next visit
          </h2>
          <p className="mt-3 text-muted-foreground">
            A simpler, safer way to book your next salon visit.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <span className="absolute top-6 right-6 font-display text-3xl font-semibold text-primary/10">
                0{index + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-5" />
              </span>
              <h3 className="font-display mt-5 text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
