
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X, Save } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type Category = {
  name: string;
  count: number;
};

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

type ServiceForm = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  status: "active" | "inactive";
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  imageUrl?: string;
};

const initialForm: ServiceForm = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  status: "active",
};

const inputStyle =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground/80 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const labelStyle = "mb-2 block text-sm font-semibold text-foreground/80";

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {};
  }
}

const EditServicePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [formData, setFormData] = useState<ServiceForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImage, setCurrentImage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  // Load categories and existing service information.
  useEffect(() => {
    let isMounted = true;

    const loadService = async () => {
      try {
        if (!API_URL) {
          throw new Error("API URL is missing. Check NEXT_PUBLIC_API_URL.");
        }

        if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
          throw new Error("Invalid service ID.");
        }

        const [tokenResult, categoryResponse] = await Promise.all([
          authClient.token(),
          fetch(`${API_URL}/api/services/categories`, {
            cache: "no-store",
          }),
        ]);

        const token = tokenResult.data?.token;

        if (!token) {
          throw new Error("Authentication required. Please sign in again.");
        }

        const categoryResult =
          await readResponse<Category[]>(categoryResponse);

        if (!categoryResponse.ok || !categoryResult.success) {
          throw new Error(
            categoryResult.message || "Could not load service categories."
          );
        }

        const serviceResponse = await fetch(
          `${API_URL}/api/services/admin/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const serviceResult =
          await readResponse<Service>(serviceResponse);

        if (
          !serviceResponse.ok ||
          !serviceResult.success ||
          !serviceResult.data
        ) {
          throw new Error(
            serviceResult.message || "Could not load service information."
          );
        }

        if (!isMounted) return;

        const service = serviceResult.data;

        setCategories(categoryResult.data || []);

        setFormData({
          serviceName: service.serviceName || "",
          category: service.category || "",
          description: service.description || "",
          price: String(service.price ?? ""),
          duration: String(service.duration ?? ""),
          status: service.status || "active",
        });

        setCurrentImage(service.image || "");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load service information.";

        if (isMounted) {
          setPageError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadService();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle text, number, select and textarea changes.
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

  // Validate new image.
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a PNG, JPG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  // Remove selected replacement image.
  const removeSelectedImage = () => {
    setSelectedImage(null);

    const fileInput = document.getElementById(
      "image"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Upload a new image only when the user selects one.
  const uploadImage = async (token: string): Promise<string> => {
    if (!selectedImage) {
      return currentImage;
    }

    const imageData = new FormData();
    imageData.append("image", selectedImage);

    const response = await fetch(
      `${API_URL}/api/services/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageData,
      }
    );

    const result = await readResponse<never>(response);

    if (!response.ok || !result.success || !result.imageUrl) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.imageUrl;
  };

  // Submit updated service information.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    const serviceName = formData.serviceName.trim();
    const description = formData.description.trim();
    const price = Number(formData.price);
    const duration = Number(formData.duration);

    if (!serviceName || serviceName.length > 100) {
      toast.error("Service name must be between 1 and 100 characters.");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a service category.");
      return;
    }

    if (!description || description.length > 2000) {
      toast.error("Description must be between 1 and 2000 characters.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Duration must be a positive number.");
      return;
    }

    if (!currentImage && !selectedImage) {
      toast.error("Please select a service image.");
      return;
    }

    try {
      setSubmitting(true);

      if (!API_URL) {
        throw new Error("API URL is missing. Check NEXT_PUBLIC_API_URL.");
      }

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      // Keep the old image unless a replacement is selected.
      const imageUrl = await uploadImage(token);

      const updatedService = {
        serviceName,
        category: formData.category,
        description,
        price,
        duration,
        image: imageUrl,
        status: formData.status,
      };

      const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedService),
      });

      const result = await readResponse<Service>(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update service.");
      }

      toast.success("Service updated successfully!");
      router.push("/admin/services");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the service.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-violet-600" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading service information...
          </p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">
          Unable to load service
        </h2>
        <p className="mt-2 text-sm text-red-600">{pageError}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-violet-600"
        >
          <ArrowLeft size={17} />
          Back to Services
        </button>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Edit Service
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Update your service information and keep your details up to date.
        </p>
      </div>

      {/* Edit Service Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      >
        <div className="border-b border-border bg-violet-50/50 px-5 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-foreground">
            Service Information
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the fields below and save your changes.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          {/* Service Name */}
          <div>
            <label htmlFor="serviceName" className={labelStyle}>
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceName"
              name="serviceName"
              type="text"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="Enter service name"
              maxLength={100}
              required
              className={inputStyle}
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelStyle}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className={labelStyle}>
                Service Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelStyle}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write service description..."
              rows={5}
              maxLength={2000}
              required
              className={`${inputStyle} resize-y`}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground/70">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelStyle}>
                Price (à§³) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0.01"
                step="0.01"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="duration" className={labelStyle}>
                Duration (Minutes) <span className="text-red-500">*</span>
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration"
                min="1"
                step="1"
                required
                className={inputStyle}
              />
            </div>
          </div>

          {/* Existing Image */}
          <div>
            <label className={labelStyle}>Current Service Image</label>
            {currentImage ? (
              <div className="overflow-hidden rounded-xl border border-border p-3">
                <img
                  src={currentImage}
                  alt={formData.serviceName || "Current service"}
                  className="h-52 w-full rounded-lg object-cover sm:h-64"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This image will remain unless you upload a replacement.
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                No current image available.
              </p>
            )}
          </div>

          {/* New Image Upload */}
          <div className="space-y-2">
            <label htmlFor="image" className={labelStyle}>
              Upload New Image (Optional)
            </label>

            <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-5">
              <div className="flex flex-col items-center text-center">
                <Upload className="mb-3 h-8 w-8 text-violet-600" />
                <p className="text-sm font-semibold text-foreground/90">
                  Choose a new service image
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, JPEG or WEBP (Maximum 5MB)
                </p>
              </div>

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="mt-4 block w-full cursor-pointer rounded-lg border border-border bg-white text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:border-0 file:bg-violet-600 file:px-5 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-700"
              />
            </div>

            {selectedImage && (
              <div className="flex flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground/90">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="inline-flex w-fit items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 border-t border-border bg-secondary/60 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
            disabled={submitting}
            className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground/80 transition hover:bg-secondary disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditServicePage;
