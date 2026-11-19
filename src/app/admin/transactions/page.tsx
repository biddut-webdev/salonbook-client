
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ReceiptText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type Transaction = {
  _id: string;
  appointmentId?: string;
  customerId?: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
  customer?: {
    name?: string;
    email?: string;
    image?: string;
  };
  service?: {
    serviceName?: string;
    image?: string;
  };
  appointment?: {
    appointmentDate?: string;
    timeSlot?: string;
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: Transaction[];
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${(currency || "").toUpperCase()}`;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch transactions without updating component state here.
  const fetchTransactions = useCallback(async (): Promise<Transaction[]> => {
    if (!API_URL) {
      throw new Error("API URL is not configured.");
    }

    const tokenResult = await authClient.token();
    const token = tokenResult.data?.token;

    if (!token) {
      throw new Error(
        "Authentication token not found. Please sign in again."
      );
    }

    const response = await fetch(`${API_URL}/api/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load transactions.");
    }

    return result.data || [];
  }, []);

  // Initial data loading
  useEffect(() => {
    let cancelled = false;

    fetchTransactions()
      .then((data) => {
        if (cancelled) return;

        setTransactions(data);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Something went wrong.";

        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTransactions]);

  // Refresh transactions
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchTransactions();

      setTransactions(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Search and status filtering
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      const matchesSearch =
        !query ||
        transaction.customer?.name?.toLowerCase().includes(query) ||
        transaction.customer?.email?.toLowerCase().includes(query) ||
        transaction.service?.serviceName?.toLowerCase().includes(query) ||
        transaction.stripeSessionId?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [transactions, search, statusFilter]);

  const paidCount = transactions.filter(
    (transaction) => transaction.status === "paid"
  ).length;

  const failedCount = transactions.filter(
    (transaction) => transaction.status === "failed"
  ).length;

  const stats = [
    {
      title: "Total Transactions",
      value: transactions.length,
      icon: CreditCard,
      iconClass: "bg-violet-100 text-violet-600",
    },
    {
      title: "Successful Payments",
      value: paidCount,
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Failed Payments",
      value: failedCount,
      icon: XCircle,
      iconClass: "bg-red-100 text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
        <p className="text-sm text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and monitor all customer payment records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              All Transactions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Payment history from Stripe Checkout.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, service..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
              <ReceiptText className="h-7 w-7 text-violet-500" />
            </div>

            <h3 className="font-semibold text-gray-900">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Transactions will appear here after verified payments."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Service</th>
                  <th className="px-5 py-4 font-semibold">Appointment</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Stripe Session</th>
                  <th className="px-5 py-4 font-semibold">Payment Status</th>
                  <th className="px-5 py-4 font-semibold">Transaction Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {transaction.customer?.image ? (
                          <img
                            src={transaction.customer.image}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {transaction.customer?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.customer?.name || "Unknown Customer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.customer?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {transaction.service?.serviceName ||
                          "Service unavailable"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(transaction.appointment?.appointmentDate)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {transaction.appointment?.timeSlot || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        title={transaction.stripeSessionId}
                        className="font-mono text-xs text-gray-600"
                      >
                        {transaction.stripeSessionId
                          ? `${transaction.stripeSessionId.slice(0, 18)}...`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {transaction.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                          <XCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && filteredTransactions.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
