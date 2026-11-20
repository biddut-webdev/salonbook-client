import Link from "next/link";
import {
  ArrowUpRight,
  Brush,
  Flower2,
  Hand,
  Scissors,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { CategoryInfo } from "@/types";

// A matching icon per known category. Unknown categories fall back to a sparkle.
const ICONS: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /haircut|styling|hair cut/i, icon: Scissors },
  { match: /colou?r/i, icon: Brush },
  { match: /treatment/i, icon: Sparkles },
  { match: /facial|skin/i, icon: Flower2 },
  { match: /makeup/i, icon: Sparkles },
  { match: /manicure|pedicure|nail/i, icon: Hand },
  { match: /spa|massage/i, icon: Waves },
];

function iconFor(name: string): LucideIcon {
  return ICONS.find((entry) => entry.match.test(name))?.icon ?? Sparkles;
}

/**
 * Grid of service categories. Each card links to Browse Services
 * with that category already selected in the URL.
 */
export default function CategoryGrid({ categories }: { categories: CategoryInfo[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = iconFor(category.name);

        return (
          <Link
            key={category.name}
            href={`/services?category=${encodeURIComponent(category.name)}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-base font-semibold">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.count} {category.count === 1 ? "service" : "services"}
                </p>
              </div>
              <ArrowUpRight className="mt-1 size-4 text-muted-foreground/70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
