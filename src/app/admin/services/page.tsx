
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

  useEffect(() => {
    let ignore = false;

    const loadServices = async () => {
      try {
        const result = await authClient.token();
        const token = result.data?.token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
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

        if (!ignore) {
          setServices(data.data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

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

  const filteredServices = services.filter((service) =>
    service.serviceName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Services
          </h1>

          <p className="mt-1 text-sm text-gray-500">
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

      {/* Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500"
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
            onClick={handleRetry}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Scissors
            className="mx-auto text-gray-400"
            size={36}
          />

          <h3 className="mt-4 font-semibold text-gray-800">
            No services found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add a new service or try another search.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr
                    key={service._id}
                    className="hover:bg-gray-50"
                  >
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

                        <span className="font-semibold text-gray-800">
                          {service.serviceName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {service.category}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      ৳{service.price}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {service.duration} min
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${service.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {service.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/services/${service._id}/edit`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-violet-50 hover:text-violet-600"
                          title="Edit service"
                        >
                          <Pencil size={17} />
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger
                            type="button"
                            className="..."
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
                                Are you sure you want to delete &quot;{service.serviceName}&quot;?
                                This action cannot be undone.
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
      <p className="text-sm text-gray-500">
        Total services: {services.length}
      </p>
    </div>
  );
};

export default AdminServicesPage;
