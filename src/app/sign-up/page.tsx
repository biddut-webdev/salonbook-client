"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getPasswordError, isValidEmail, PASSWORD_RULES } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import GoogleButton from "@/components/auth/google-button";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already signed in? No need to register again.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isPending, session, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const passwordError = getPasswordError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email,
      password,
      // Optional profile picture URL (upload support comes from ImgBB later).
      image: imageUrl.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Could not create your account.");
      return;
    }

    toast.success("Account created! Welcome to SalonBook.");
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up to book salon services and track your appointments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`${inputClass} pr-10`}
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Live password rules */}
          <ul className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="size-3" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="imageUrl" className="text-sm font-medium">
            Profile image URL <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="imageUrl"
            type="url"
            className={inputClass}
            placeholder="https://example.com/photo.jpg"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <UserPlus className="size-4" />
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
