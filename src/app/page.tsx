import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/hero";
import CategoryGrid from "@/components/home/category-grid";
import WhyChooseUs from "@/components/home/why-choose-us";
import ServiceCard from "@/components/services/service-card";
import Skeleton from "@/components/ui/skeleton";
import { getCategories, getFeaturedServices } from "@/lib/api";

// Loading placeholders shown while the sections above fetch their data.
function ServiceGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-4/3 w-full" />
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
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

// Dynamic section 1: six active services from the database.
async function FeaturedServices() {
  const services = await getFeaturedServices(6).catch(() => []);

  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
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

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Featured services */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Services
            </h2>
            <p className="mt-1 text-muted-foreground">
              Popular treatments our customers love.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-1 text-muted-foreground">
            Find the service you need in one click.
          </p>
        </div>

        <Suspense fallback={<CategoryGridSkeleton />}>
          <Categories />
        </Suspense>
      </section>

      <WhyChooseUs />
    </>
  );
}
