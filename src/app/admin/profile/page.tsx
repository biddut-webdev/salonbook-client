
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Profile = {
  name: string;
  email: string;
  image: string | null;
  phone: string;
  role: "customer" | "admin";
  isBlocked: boolean;
};

const AdminProfilePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenResult = await authClient.token();
        const token = tokenResult.data?.token;

        if (!token) {
          toast.error("Authentication token not found.");
          return;
        }

        const response = await fetch(`${API_URL}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load profile.");
        }

        const data: Profile = result.data;

        setProfile(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          image: data.image || "",
        });
      } catch (error) {
        console.error("Profile loading error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Upload profile image
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/profile/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      setFormData((prev) => ({
        ...prev,
        image: result.imageUrl,
      }));

      toast.success("Profile image uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Save profile changes
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);

    try {
      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          image: formData.image,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile update failed.");
      }

      setProfile((prev) =>
        prev
          ? {
            ...prev,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            image: formData.image || null,
          }
          : prev
      );

      await authClient.updateUser({
        name: formData.name.trim(),
        image: formData.image || undefined,
      });

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <UserRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground/70" />
        <h2 className="text-lg font-semibold text-foreground">
          Profile not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or login again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Page Heading */}
      <div>
        <p className="eyebrow text-primary">Account</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          My profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="h-32 bg-gradient-to-r from-primary via-[oklch(0.62_0.13_25)] to-gold" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative h-24 w-24 shrink-0 rounded-2xl border-4 border-card bg-secondary shadow-soft">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Admin profile"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl">
                    <UserRound className="h-10 w-10 text-muted-foreground/70" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-white shadow hover:bg-rose-700 disabled:opacity-50"
                  aria-label="Change profile image"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                <ShieldCheck className="h-4 w-4" />
                Administrator
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${profile.isBlocked
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                  }`}
              >
                {profile.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile information below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground/80"
            >
              Full Name
            </label>

            <div className="relative">
              <UserRound className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                maxLength={60}
                required
                className="w-full rounded-xl border border-border py-3 pr-4 pl-11 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground/80"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-secondary/40 py-3 pr-4 pl-11 text-sm text-muted-foreground outline-none"
              />
            </div>

            <p className="text-xs text-muted-foreground/70">
              Email address cannot be changed here.
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground/80"
            >
              Phone Number
            </label>

            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                maxLength={20}
                className="w-full rounded-xl border border-border py-3 pr-4 pl-11 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          {/* Account Role */}
          <div className="space-y-2">
            <label
              htmlFor="role"
              className="text-sm font-medium text-foreground/80"
            >
              Account Role
            </label>

            <input
              id="role"
              type="text"
              value="Administrator"
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end border-t border-border pt-5">
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
