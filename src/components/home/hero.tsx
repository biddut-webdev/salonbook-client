import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Home page banner: title, short description, CTA and a salon-themed image.
 */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1800&q=80"
        alt="Interior of a modern salon"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />

      {/* Plum gradient so text is readable and the palette stays consistent */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.22_0.05_350/92%)] via-[oklch(0.26_0.06_350/75%)] to-[oklch(0.32_0.07_10/35%)]" />

      <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-24">
        {/* Copy */}
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
            <Sparkles className="size-3.5 text-gold" />
            Premium salon experience in Dhaka
          </span>

          <h1 className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Beauty, booked
            <span className="block italic text-gold">in seconds.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Explore haircuts, colouring, skincare and spa treatments, then reserve
            the time that suits you. No phone calls, no queues — just show up and
            glow.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-12 gap-2 px-7 text-base shadow-soft"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              Explore Salon Services
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/35 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Create an account
            </Button>
          </div>

          {/* Trust strip */}
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 text-white">
            <div>
              <dt className="text-xs tracking-wide text-white/70 uppercase">
                Rating
              </dt>
              <dd className="mt-1 flex items-center gap-1 text-lg font-semibold">
                4.9
                <Star className="size-4 fill-gold text-gold" />
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-white/70 uppercase">
                Stylists
              </dt>
              <dd className="mt-1 text-lg font-semibold">12+</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-white/70 uppercase">
                Happy clients
              </dt>
              <dd className="mt-1 text-lg font-semibold">3,500+</dd>
            </div>
          </dl>
        </div>

        {/* Floating "next available slot" card */}
        <div className="w-full max-w-sm self-start rounded-3xl border border-white/20 bg-white/95 p-6 shadow-soft-lg backdrop-blur lg:self-auto">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CalendarCheck className="size-5" />
            </span>
            <div>
              <p className="eyebrow text-primary">Today at SalonBook</p>
              <p className="font-display text-lg">Slots open until 8 PM</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3 text-sm">
            {[
              { time: "11:00 AM", name: "Signature Haircut" },
              { time: "02:30 PM", name: "Glow Facial" },
              { time: "06:00 PM", name: "Spa Massage" },
            ].map((slot) => (
              <li
                key={slot.time}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-2.5"
              >
                <span className="text-muted-foreground">{slot.time}</span>
                <span className="font-medium">{slot.name}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted-foreground">
            Confirmed appointments can be paid online with Stripe.
          </p>
        </div>
      </div>
    </section>
  );
}
