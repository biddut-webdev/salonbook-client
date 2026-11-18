"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryInfo } from "@/types";

/**
 * Search box + category filter + price sorting.
 * Every change is written into the URL (?search=&category=&sort=),
 * so the server component re-fetches filtered services.
 */
export default function ServiceFilters({
  categories,
}: {
  categories: CategoryInfo[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local input value; the URL is updated after a short delay (debounce)
  // so we do not send a request for every typed character.
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = search.trim();
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      if (params.toString() !== searchParams.toString()) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, pathname, router, searchParams]);

  // Selects update the URL immediately.
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("category") ||
    searchParams.has("sort");

  function clearFilters() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search by service name */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search services by name..."
          className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>

      {/* Category filter */}
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(event) => setParam("category", event.target.value)}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Sort by price */}
      <select
        value={searchParams.get("sort") ?? ""}
        onChange={(event) => setParam("sort", event.target.value)}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label="Sort services"
      >
        <option value="">Newest first</option>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
