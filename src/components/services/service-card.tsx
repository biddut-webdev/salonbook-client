import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Service } from "@/types";

/**
 * One salon service card.
 * Reused on the Home page and on the Browse Services page.
 */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      {/* Image + category badge */}
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase shadow-sm backdrop-blur">
          {service.category}
        </span>
        <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-foreground shadow-sm">
          ${service.price}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display line-clamp-1 text-lg font-semibold">
          {service.serviceName}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            {service.duration} min
          </span>

          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View details
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
