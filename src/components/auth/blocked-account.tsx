"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

/**
 * Shown instead of a dashboard when the administrator has blocked the
 * account. The API also rejects every protected request with 403.
 */
export default function BlockedAccount() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-6" />
      </span>
      <p className="eyebrow mt-5 text-primary">Access restricted</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
        Account blocked
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your account has been blocked by the salon administrator, so protected
        features are unavailable. Please contact the salon if you think this is
        a mistake.
      </p>
      <Button
        className="mt-8 rounded-full px-6"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
