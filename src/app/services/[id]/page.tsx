import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import AppointmentPanel from "@/components/services/appointment-panel";
import RequireAuth from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { getService } from "@/lib/api";

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Sparkles className="size-6" />
      </span>
      <p className="eyebrow mt-5 text-primary">Service unavailable</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
        We could not open this service
      </h1>
      <p className="mt-3 text-muted-foreground">{message}</p>
      <Button
        className="mt-8 rounded-full px-6"
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
    <RequireAuth>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          All services
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Service image */}
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-soft-lg">
            <Image
              src={service.image}
              alt={service.serviceName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase shadow-sm backdrop-blur">
              {service.category}
            </span>
            <span className="absolute right-4 bottom-4 rounded-full bg-white/95 px-4 py-1.5 text-lg font-bold text-foreground shadow-sm">
              ${service.price}
            </span>
          </div>

          {/* Service information + booking */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow text-primary">Salon service</p>
              <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {service.serviceName}
              </h1>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <dt className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Price
                  </dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-primary">
                    ${service.price}
                  </dd>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <dt className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Duration
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-lg font-semibold">
                    <Clock className="size-4 text-primary" />
                    {service.duration} min
                  </dd>
                </div>
              </dl>
            </div>

            <AppointmentPanel service={service} />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
