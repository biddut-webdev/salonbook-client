// Client-side form rules (the server validates again by itself).

export const PASSWORD_RULES = [
  "At least 6 characters",
  "One uppercase letter (A-Z)",
  "One lowercase letter (a-z)",
];

export function getPasswordError(password: string) {
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  return null;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
