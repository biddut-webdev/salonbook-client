import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="eyebrow text-primary">Error 404</p>
      <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight">
        This page took the day off
      </h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist or was moved. Let us get you
        back to something beautiful.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          className="rounded-full px-6"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <Home className="size-4" />
          Back to Home
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-6"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          <Search className="size-4" />
          Browse Services
        </Button>
      </div>
    </div>
  );
}
