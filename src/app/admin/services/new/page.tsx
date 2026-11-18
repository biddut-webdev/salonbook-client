
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type Category = {
  name: string;
  count: number;
};

const AddServicePage = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    serviceName: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    image: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/categories`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load categories.");
        }

        const categoryList = Array.isArray(result.data)
          ? result.data
          : result.categories;

        if (!Array.isArray(categoryList)) {
          throw new Error("Invalid category response from server.");
        }

        if (!ignore) {
          setCategories(categoryList);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load categories."
          );
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (!formData.category) {
        throw new Error("Please select a category.");
      }

      const result = await authClient.token();
      const token = result.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            duration: Number(formData.duration),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to add service.");
      }

      toast.success("Service added successfully!");

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Header */}
      <div>
        <Link
          href="/admin/services"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Services
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          Add New Service
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new salon service to your collection.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Service Name */}
        <div className="space-y-2">
          <label
            htmlFor="serviceName"
            className="text-sm font-semibold text-gray-700"
          >
            Service Name *
          </label>

          <input
            id="serviceName"
            name="serviceName"
            type="text"
            placeholder="e.g. Hair Cutting"
            value={formData.serviceName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-semibold text-gray-700"
          >
            Category *
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={categoriesLoading || categories.length === 0}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-100"
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select a category"}
            </option>

            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {!categoriesLoading && categories.length === 0 && (
            <p className="text-sm text-red-500">
              No categories available. Please try again.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-gray-700"
          >
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe your service..."
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-semibold text-gray-700"
            >
              Price (৳) *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 500"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="duration"
              className="text-sm font-semibold text-gray-700"
            >
              Duration (Minutes) *
            </label>

            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              placeholder="e.g. 45"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Image */}
        <div className="space-y-2">
          <label
            htmlFor="image"
            className="text-sm font-semibold text-gray-700"
          >
            Image URL *
          </label>

          <input
            id="image"
            name="image"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-semibold text-gray-700"
          >
            Service Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/services"
            className="rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || categoriesLoading || categories.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding Service...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddServicePage;
