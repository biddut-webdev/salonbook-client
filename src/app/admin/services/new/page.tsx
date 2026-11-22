
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Upload, X } from "lucide-react";
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
    status: "active",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (!formData.category) {
        throw new Error("Please select a category.");
      }

      if (!selectedImage) {
        throw new Error("Please upload a service image.");
      }

      if (Number(formData.price) <= 0) {
        throw new Error("Price must be greater than 0.");
      }

      if (Number(formData.duration) <= 0) {
        throw new Error("Duration must be greater than 0.");
      }

      const result = await authClient.token();
      const token = result.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      // Step 1: Upload image
      const imageFormData = new FormData();
      imageFormData.append("image", selectedImage);

      const imageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
        }
      );

      const imageResult = await imageResponse.json();

      if (!imageResponse.ok || !imageResult.success || !imageResult.imageUrl) {
        throw new Error(imageResult.message || "Image upload failed.");
      }

      // Step 2: Save service with uploaded image URL
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
            image: imageResult.imageUrl,
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
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Services
        </Link>

        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Add new service
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Add a new salon service to your collection.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
      >
        {/* Service Name */}
        <div className="space-y-2">
          <label
            htmlFor="serviceName"
            className="text-sm font-semibold text-foreground/80"
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
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-semibold text-foreground/80"
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
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:bg-secondary"
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
            className="text-sm font-semibold text-foreground/80"
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
            className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-semibold text-foreground/80"
            >
              Price (à§³) *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 500"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="duration"
              className="text-sm font-semibold text-foreground/80"
            >
              Duration (Minutes) *
            </label>

            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 45"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>


        {/* Image Upload */}
        <div className="space-y-2">
          <label
            htmlFor="image"
            className="text-sm font-semibold text-foreground/80"
          >
            Service Image *
          </label>

          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageChange}
            required={!selectedImage}
            className="block w-full cursor-pointer rounded-xl border border-border bg-card text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:border-0 file:bg-primary file:px-5 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
          />

          <p className="text-xs text-muted-foreground">
            PNG, JPG, JPEG or WEBP (Maximum 5MB)
          </p>

          {selectedImage && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
              <span className="truncate text-sm text-foreground/80">
                {selectedImage.name}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  const input = document.getElementById("image") as HTMLInputElement;
                  input.value = "";
                }}
                className="ml-3 rounded-lg p-1 text-muted-foreground hover:text-red-500"
                aria-label="Remove selected image"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>


        {/* Status */}
        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-semibold text-foreground/80"
          >
            Service Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/services"
            className="rounded-xl border border-border px-6 py-3 text-center text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading || categoriesLoading || categories.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
