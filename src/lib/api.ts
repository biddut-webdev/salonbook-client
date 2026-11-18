import type { CategoryInfo, Service } from "@/types";

// Base URL of the Express API (server-side and client-side both read this).
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Small wrapper around fetch that returns the API body and throws on errors. */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${response.status})`);
  }

  const body = await response.json();
  return body.data as T;
}

// Public data is cached briefly so a Home page refresh does not hit the API
// on every request, while still showing recent changes.
const publicOptions = { next: { revalidate: 60 } };

export function getFeaturedServices(limit = 6) {
  return apiFetch<Service[]>(`/api/services?limit=${limit}`, publicOptions);
}

export type ServiceQuery = {
  search?: string;
  category?: string;
  sort?: string;
};

export function getServices({ search, category, sort }: ServiceQuery = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);

  const query = params.toString();
  return apiFetch<Service[]>(
    `/api/services${query ? `?${query}` : ""}`,
    publicOptions,
  );
}

export function getCategories() {
  return apiFetch<CategoryInfo[]>("/api/services/categories", publicOptions);
}

export function getService(id: string) {
  return apiFetch<Service>(`/api/services/${id}`, publicOptions);
}

export type AppointmentPayload = {
  serviceId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;
  message?: string;
};

/**
 * Creates an appointment request. Requires the JWT from Better Auth,
 * which the Express API verifies and checks the role against.
 */
export async function createAppointment(
  token: string,
  payload: AppointmentPayload,
) {
  const response = await fetch(`${API_URL}/api/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Could not create the appointment.");
  }

  return body.data as AppointmentPayload & { _id: string; status: string };
}
