"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route level error boundary. Next.js renders this whenever a page or
 * data request throws, so users never see a blank screen.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        We could not load this page. Please try again — if it keeps happening,
        come back in a moment.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="rounded-full px-6" onClick={reset}>
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-6"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
