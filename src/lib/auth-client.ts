import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  plugins: [jwtClient()],
});

export type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: "customer" | "admin";
  isBlocked?: boolean;
};
