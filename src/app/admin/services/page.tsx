
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Scissors,
  Loader2,
  Power,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load all services for admin
  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await authClient.token();
      const token = result.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load services.");
      }

      if (!Array.isArray(data.data)) {
        throw new Error("Invalid services response from server.");
      }

      setServices(data.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchServices = async () => {
      try {
        const result = await authClient.token();
        const token = result.data?.token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/admin/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load services.");
        }

        if (!Array.isArray(data.data)) {
          throw new Error("Invalid services response from server.");
        }

        if (!ignore) {
          setServices(data.data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      ignore = true;
    };
  }, []);

  // Delete service
  const handleDelete = async (id: string) => {
    try {
      const result = await authClient.token();
      const token = result.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service.");
      }

      setServices((previous) =>
        previous.filter((service) => service._id !== id)
      );

      toast.success("Service deleted successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  // Activate or deactivate service
  const handleToggleStatus = async (service: Service) => {
    const newStatus =
      service.status === "active" ? "inactive" : "active";

    try {
      setUpdatingId(service._id);

      const result = await authClient.token();
      const token = result.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/${service._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update service status.");
      }

      setServices((previous) =>
        previous.map((item) =>
          item._id === service._id
            ? { ...item, status: newStatus }
            : item
        )
      );

      toast.success(
        newStatus === "active"
          ? "Service activated successfully!"
          : "Service deactivated successfully!"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search services
  const filteredServices = services.filter((service) =>
    `${service.serviceName} ${service.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manage Services
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage all salon services from one place.
          </p>
        </div>

        <Link
          href="/admin/services/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add New Service
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Services</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">
            {services.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Services</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {services.filter((service) => service.status === "active").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Inactive Services</p>
          <h2 className="mt-2 text-2xl font-bold text-muted-foreground">
            {services.filter((service) => service.status === "inactive").length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />

          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500"
          />
        </div>
      </div>

      {/* Loading, Error and Services */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2
            className="animate-spin text-violet-600"
            size={32}
          />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          <p>{error}</p>

          <button
            onClick={loadServices}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Scissors
            className="mx-auto text-muted-foreground/70"
            size={36}
          />

          <h3 className="mt-4 font-semibold text-foreground/90">
            No services found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a new service or try another search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Availability</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredServices.map((service) => (
                  <tr
                    key={service._id}
                    className="transition hover:bg-secondary"
                  >
                    {/* Service */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.serviceName}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <Scissors size={20} />
                          </div>
                        )}

                        <span className="font-semibold text-foreground/90">
                          {service.serviceName}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {service.category}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-sm font-semibold text-foreground/90">
                      à§³{service.price}
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {service.duration} min
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${service.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-secondary text-muted-foreground"
                          }`}
                      >
                        {service.status}
                      </span>
                    </td>

                    {/* Activate / Deactivate */}
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        disabled={updatingId === service._id}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${service.status === "active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                      >
                        {updatingId === service._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Power size={15} />
                        )}

                        {service.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/services/${service._id}/edit`}
                          className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-violet-50 hover:text-violet-600"
                          title="Edit service"
                        >
                          <Pencil size={17} />
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger
                            type="button"
                            className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
                            title="Delete service"
                          >
                            <Trash2 size={17} />
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete this service?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {service.serviceName}&quot;? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => handleDelete(service._id)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total Services */}
      {!loading && !error && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredServices.length} of {services.length} services
        </p>
      )}
    </div>
  );
};

export default AdminServicesPage;
