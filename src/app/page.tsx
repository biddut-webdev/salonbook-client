import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, CreditCard, Sparkles } from "lucide-react";
import Hero from "@/components/home/hero";
import CategoryGrid from "@/components/home/category-grid";
import WhyChooseUs from "@/components/home/why-choose-us";
import ServiceCard from "@/components/services/service-card";
import Skeleton from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedServices } from "@/lib/api";

// Loading placeholders shown while the sections above fetch their data.
function ServiceGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-4/3 w-full rounded-3xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

// Dynamic section 1: six active services from the database.
async function FeaturedServices() {
  const services = await getFeaturedServices(6).catch(() => []);

  if (services.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        No services available yet. Please check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
}

// Dynamic section 2: categories (with counts) from the database.
async function Categories() {
  const categories = await getCategories().catch(() => []);

  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Categories are unavailable right now.
      </p>
    );
  }

  return <CategoryGrid categories={categories} />;
}

// Extra static section (our own idea): how booking works in three steps.
const steps = [
  {
    icon: Sparkles,
    title: "Choose a service",
    text: "Browse our menu of haircuts, colouring, facials and spa treatments.",
  },
  {
    icon: CalendarPlus,
    title: "Request a time",
    text: "Pick a date and a free time slot. The salon confirms your request.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    text: "Once confirmed, pay online through Stripe and you are all set.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Featured services */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow text-primary">The menu</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured services
            </h2>
            <p className="mt-2 text-muted-foreground">
              Popular treatments our customers love.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
          >
            View all services
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <Suspense fallback={<ServiceGridSkeleton />}>
          <FeaturedServices />
        </Suspense>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow text-primary">Explore</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the service you need in one click.
            </p>
          </div>

          <Suspense fallback={<CategoryGridSkeleton />}>
            <Categories />
          </Suspense>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
          <div>
            <p className="eyebrow text-primary">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to your next appointment
            </h2>
            <p className="mt-3 text-muted-foreground">
              SalonBook keeps the whole journey online — from picking a service
              to paying for it.
            </p>
            <Button
              className="mt-7 rounded-full px-6"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              Start booking
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>

          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="size-5" />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-widest text-muted-foreground">
                  STEP {index + 1}
                </p>
                <h3 className="font-display mt-1 text-base font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <WhyChooseUs />
    </>
  );
}
