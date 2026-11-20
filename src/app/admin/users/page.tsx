
"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Users, ShieldCheck, ShieldBan } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type User = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  isBlocked?: boolean;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Fetch all customers
  const fetchUsers = async () => {
    try {
      setError("");

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch users.");
      }

      setUsers(result.data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Block or unblock customer
  const handleBlockToggle = async (user: User) => {
    const nextBlockedStatus = !user.isBlocked;

    try {
      setUpdatingId(user._id);

      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/users/${user._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isBlocked: nextBlockedStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update customer status."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? { ...item, isBlocked: nextBlockedStatus }
            : item
        )
      );

      toast.success(
        nextBlockedStatus
          ? "Customer blocked successfully."
          : "Customer unblocked successfully."
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Search customers
  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue)
    );
  });

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, search and manage registered customers.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {users.length}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {users.filter((user) => !user.isBlocked).length}
              </h2>
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Blocked Customers</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {users.filter((user) => user.isBlocked).length}
              </h2>
            </div>
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <ShieldBan size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">
              All Customers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredUsers.length} customers found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchUsers();
              }}
              disabled={loading}
              className="rounded-lg border p-2.5 transition hover:bg-secondary disabled:opacity-50"
              title="Refresh users"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchUsers();
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-muted-foreground/70" size={32} />
            <p className="mt-3 font-medium text-foreground/80">
              No customers found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try searching with another name or email.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Joined Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-secondary">
                    {/* Customer Information */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "Customer"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-semibold text-muted-foreground">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-foreground">
                            {user.name || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${user.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleBlockToggle(user)}
                        disabled={updatingId === user._id}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${user.isBlocked
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                      >
                        {updatingId === user._id
                          ? "Updating..."
                          : user.isBlocked
                            ? "Unblock"
                            : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
