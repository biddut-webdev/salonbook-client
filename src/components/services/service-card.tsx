import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types";

/**
 * One salon service card.
 * Reused on the Home page and on the Browse Services page.
 */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image + category badge */}
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold">
          {service.serviceName}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {service.description}
        </p>

        {/* Price and duration */}
        <div className="mt-auto flex items-center gap-2 pt-2 text-sm">
          <span className="font-semibold text-primary">${service.price}</span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" />
            {service.duration} min
          </span>
        </div>

        <Button
          variant="outline"
          className="mt-2 w-full"
          nativeButton={false}
          render={<Link href={`/services/${service._id}`} />}
        >
          View Details
        </Button>
      </div>
    </article>
  );
}
