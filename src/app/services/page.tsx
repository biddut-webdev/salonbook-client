import { Suspense } from "react";
import ServiceCard from "@/components/services/service-card";
import ServiceFilters from "@/components/services/service-filters";
import Skeleton from "@/components/ui/skeleton";
import { getCategories, getServices } from "@/lib/api";

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

// Fetches the filtered services. Wrapped in Suspense so a filter change
// shows the skeleton instead of a frozen page.
async function ServiceResults({
  search,
  category,
  sort,
}: {
  search: string;
  category: string;
  sort: string;
}) {
  const services = await getServices({ search, category, sort }).catch(
    () => [],
  );

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-medium">No services found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search word or category.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {services.length} {services.length === 1 ? "service" : "services"} found
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>
    </>
  );
}

export default async function ServicesPage(props: PageProps<"/services">) {
  const params = await props.searchParams;

  const search = typeof params.search === "string" ? params.search : "";
  const category = typeof params.category === "string" ? params.category : "";
  const sort = typeof params.sort === "string" ? params.sort : "";

  const categories = await getCategories().catch(() => []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Browse Services</h1>
      <p className="mt-1 text-muted-foreground">
        Explore our salon services and book the one you love.
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ServiceFilters categories={categories} />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense
          // The key makes React show the skeleton again on every filter change.
          key={`${search}|${category}|${sort}`}
          fallback={<ServiceGridSkeleton />}
        >
          <ServiceResults search={search} category={category} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}
