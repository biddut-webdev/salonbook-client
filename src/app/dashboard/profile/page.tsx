
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Save,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Profile = {
  name: string;
  email: string;
  image: string;
  phone: string;
  role: string;
  isBlocked: boolean;
};

async function getToken() {
  const result = await authClient.token();
  const token = result.data?.token;

  if (!token) {
    throw new Error("Authentication token not found. Please sign in again.");
  }

  return token;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    image: "",
    phone: "",
    role: "customer",
    isBlocked: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load the logged-in user's own profile.
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const token = await getToken();

        const response = await fetch(`${API_URL}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load profile.");
        }

        if (active) {
          setProfile(result.data);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load your profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Upload selected image to ImgBB through the backend.
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      return;
    }

    try {
      setUploading(true);

      const token = await getToken();
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/profile/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      setProfile((previous) => ({
        ...previous,
        image: result.imageUrl,
      }));

      toast.success("Profile image uploaded successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save permitted profile fields.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          image: profile.image,
          phone: profile.phone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile update failed.");
      }

      // Refresh Better Auth's standard user fields in the client session.
      await authClient.updateUser({
        name: profile.name.trim(),
        image: profile.image || undefined,
      });

      setProfile((previous) => ({
        ...previous,
        ...result.data,
      }));

      toast.success("Your profile has been updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <p className="eyebrow text-primary">Account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          My profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and profile photo.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-8">
        <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row sm:items-center">
          <div className="relative">
            {profile.image ? (
              <img
                src={profile.image}
                alt="Profile"
                className="size-24 rounded-full border object-cover"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-10 text-muted-foreground" />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted disabled:opacity-50"
              aria-label="Upload profile image"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Click the camera icon to change your photo (max 5 MB).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  maxLength={60}
                  required
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="h-11 w-full cursor-not-allowed rounded-lg border bg-muted pl-10 pr-3 text-sm text-muted-foreground outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed here.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((previous) => ({
                      ...previous,
                      phone: event.target.value,
                    }))
                  }
                  maxLength={20}
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Account Information
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-background px-3 py-1 capitalize">
                  Role: {profile.role}
                </span>

                <span className="rounded-full bg-background px-3 py-1">
                  Status: {profile.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Role and account status are managed by the administrator.
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t pt-5">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
