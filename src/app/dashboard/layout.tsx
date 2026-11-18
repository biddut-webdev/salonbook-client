"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, type SessionUser } from "@/lib/auth-client";
import DashboardShell from "@/components/dashboard/dashboard-shell";

/**
 * Every /dashboard/* page is protected: visitors who are not signed in
 * are sent to /sign-in and come back here afterwards.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/sign-in?next=/dashboard");
    }
  }, [isPending, user, router]);

  // Session still loading (or redirecting) — show a neutral placeholder
  // instead of flashing unauthorised content.
  if (isPending || !user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="hidden h-64 animate-pulse rounded-xl bg-muted lg:block" />
          <div className="space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
