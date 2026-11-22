"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

// Small circular avatar: shows the profile image, or the first letter as fallback.
function Avatar({ user, size = "size-8" }: { user: SessionUser; size?: string }) {
  return user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.image}
      alt={user.name}
      className={cn(size, "rounded-full object-cover")}
    />
  ) : (
    <span
      className={cn(
        size,
        "grid place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
      )}
    >
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking anywhere outside of it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    setOpen(false);
    router.push("/");
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger: avatar + user name */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
      >
        <Avatar user={user} />
        <span className="max-w-28 truncate text-sm font-medium">
          {user.name}
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown: user name, dashboard, logout */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-background shadow-soft-lg">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="size-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href={user.role === "admin" ? "/admin" : "/dashboard"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-secondary"
            >
              <LayoutDashboard className="size-4 text-primary" />
              Dashboard
            </Link>
            <Link
              href={user.role === "admin" ? "/admin/profile" : "/dashboard/profile"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-secondary"
            >
              <User className="size-4 text-primary" />
              My Profile
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
