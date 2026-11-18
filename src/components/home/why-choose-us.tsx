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
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why Choose SalonBook?
          </h2>
          <p className="mt-2 text-muted-foreground">
            A simpler, safer way to book your next salon visit.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
