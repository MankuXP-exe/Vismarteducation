"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import StatsCards from "@/components/admin/StatsCards";

const revenue = [
  { day: "1", amount: 12000 },
  { day: "7", amount: 42000 },
  { day: "14", amount: 61000 },
  { day: "21", amount: 94000 },
  { day: "30", amount: 132000 },
];

const enrollments = [
  { batch: "12 Com", value: 180 },
  { batch: "11 Sci", value: 140 },
  { batch: "BCom", value: 96 },
  { batch: "Tally", value: 72 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
        <p className="text-sm text-gray-500">Revenue, enrollment, and platform operations.</p>
      </div>
      <StatsCards />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-gray-900">Revenue last 30 days</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Line type="monotone" dataKey="amount" stroke="#5c35d9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-gray-900">Enrollments by batch</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={enrollments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Bar dataKey="value" fill="#5c35d9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
