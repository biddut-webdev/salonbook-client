"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient, type SessionUser } from "@/lib/auth-client";
import BlockedAccount from "@/components/auth/blocked-account";

/**
 * Client-side gate for protected pages that are server-rendered.
 * While the session is loading it shows a skeleton; unauthenticated visitors
 * are sent to the sign-in page and blocked users see a notice instead.
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, user, pathname, router]);

  // Session still loading (or redirecting) — show a calm skeleton.
  if (isPending || !user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="aspect-4/3 animate-pulse rounded-3xl bg-muted" />
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (user.isBlocked) {
    return <BlockedAccount />;
  }

  return <>{children}</>;
}
