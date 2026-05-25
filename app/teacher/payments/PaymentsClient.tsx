"use client";

import { useState, useMemo } from "react";
import {
  Search,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Tag,
  Percent,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Ban,
} from "lucide-react";

type Payment = {
  id: string;
  student: string;
  batch: string;
  amount: number;
  discount: string | null;
  razorpayId: string | null;
  status: string;
  createdAt: string;
};

const ITEMS_PER_PAGE = 25;

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: any; classes: string }> = {
    success: { label: "Success", icon: CheckCircle, classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" },
    pending: { label: "Pending", icon: Clock, classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" },
    failed: { label: "Failed", icon: XCircle, classes: "bg-red-50 text-red-700 ring-1 ring-red-600/20" },
    refunded: { label: "Refunded", icon: RotateCcw, classes: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20" },
    cancelled: { label: "Cancelled", icon: Ban, classes: "bg-gray-50 text-gray-600 ring-1 ring-gray-300" },
  };
  const c = config[status] || { label: status, icon: Tag, classes: "bg-gray-50 text-gray-700 ring-1 ring-gray-300" };
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.classes}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function getDiscountLabel(discount: string | null): string | null {
  if (!discount || discount === "none") return null;
  const known: Record<string, string> = {
    army: "Army (50%)",
    single_parent: "Single Parent (₹5000)",
    disabled: "Disabled (50%)",
    coupon: "Coupon",
  };
  return known[discount] || discount;
}

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return payments.filter((p) => {
      if (q && !p.student.toLowerCase().includes(q) && !(p.razorpayId?.toLowerCase().includes(q))) {
        return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [payments, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const totalAmount = useMemo(
    () => payments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const statuses = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => set.add(p.status));
    return Array.from(set);
  }, [payments]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Payments</p>
          <p className="text-xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Successful</p>
          <p className="text-xl font-bold text-emerald-600">
            {payments.filter((p) => p.status === "success").length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4" />
            {totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-xl font-bold text-red-600">
            {payments.filter((p) => p.status === "failed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or Razorpay ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} of {payments.length}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Batch</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Razorpay ID</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No payments match your search.
                  </td>
                </tr>
              ) : (
                paged.map((p) => {
                  const discountLabel = getDiscountLabel(p.discount);
                  return (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.student}</td>
                      <td className="px-4 py-3 text-gray-700">{p.batch}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        {discountLabel ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-600/20">
                            <Percent className="h-3 w-3" />
                            {discountLabel}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-[140px] truncate" title={p.razorpayId || ""}>
                        {p.razorpayId || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paged.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No payments found.
          </div>
        ) : (
          paged.map((p) => {
            const discountLabel = getDiscountLabel(p.discount);
            return (
              <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.student}</p>
                    <p className="text-xs text-gray-500">{p.batch}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </span>
                  {discountLabel && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      <Percent className="h-3 w-3" />
                      {discountLabel}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono truncate max-w-[180px]">{p.razorpayId || "—"}</span>
                  <span>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-purple-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
