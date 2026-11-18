import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Points to the Express server where Better Auth is mounted.
// The same env var works in development and on the deployed site.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Lets us request a JWT for the Express API (Authorization: Bearer ...).
  plugins: [jwtClient()],
});

// The logged-in user. `role` comes from our custom Better Auth field.
export type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: "customer" | "admin";
};
