import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import AppointmentPanel from "@/components/services/appointment-panel";
import { Button } from "@/components/ui/button";
import { getService } from "@/lib/api";

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Service unavailable</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button
        className="mt-6"
        variant="outline"
        nativeButton={false}
        render={<Link href="/services" />}
      >
        <ArrowLeft className="size-4" />
        Back to services
      </Button>
    </div>
  );
}

export default async function ServiceDetailsPage(
  props: PageProps<"/services/[id]">,
) {
  const { id } = await props.params;

  const service = await getService(id).catch(() => null);

  if (!service) {
    return (
      <ErrorState message="This service does not exist, or it is currently inactive." />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/services"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All services
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Service image */}
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
          <Image
            src={service.image}
            alt={service.serviceName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Service information + booking */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {service.category}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {service.serviceName}
            </h1>
            <p className="mt-3 text-muted-foreground">{service.description}</p>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-xl font-bold text-primary">
                ${service.price}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="size-4" />
                {service.duration} minutes
              </span>
            </div>
          </div>

          <AppointmentPanel service={service} />
        </div>
      </div>
    </div>
  );
}
