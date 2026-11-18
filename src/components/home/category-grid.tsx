import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryInfo } from "@/types";

/**
 * Grid of service categories. Each card links to Browse Services
 * with that category already selected in the URL.
 */
export default function CategoryGrid({ categories }: { categories: CategoryInfo[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/services?category=${encodeURIComponent(category.name)}`}
          className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.count} {category.count === 1 ? "service" : "services"}
              </p>
            </div>
            <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}
