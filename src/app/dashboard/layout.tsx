
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, type SessionUser } from "@/lib/auth-client";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in?next=/dashboard");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user.role !== "customer") {
      router.replace("/");
    }
  }, [isPending, user, router]);

  if (isPending || !user || user.role !== "customer") {
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
