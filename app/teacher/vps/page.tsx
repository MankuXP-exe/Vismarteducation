"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Monitor,
  HardDrive,
  Cpu,
  Activity,
  RefreshCw,
  Server,
  Disc,
  Clock,
  Wifi,
  WifiOff,
  Film,
  Database,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type SystemStats = {
  cpu: { usage: number; cores: number; load_1: number; load_5: number; load_15: number };
  memory: { total: number; used: number; free: number; percent: number };
  disk: { total: number; used: number; free: number; percent: number };
  uptime: string;
  services: { name: string; status: "running" | "stopped" | "error"; cpu: string; memory: string }[];
};

type StorageStats = {
  recordings: { count: number; size_gb: number; path: string };
  uploads: { count: number; size_gb: number };
};

const API_SECRET = process.env.NEXT_PUBLIC_VPS_API_SECRET || "random_secret_key_123";
const API_BASE = "https://api.vismartlearningeducation.com";

const SERVICE_ICONS: Record<string, typeof Server> = {
  nginx: Monitor,
  mediamtx: Activity,
  minio: Database,
  "redis-server": Database,
  "vi-smart-api": Server,
};

const SERVICE_LABELS: Record<string, string> = {
  nginx: "Nginx",
  mediamtx: "MediaMTX",
  minio: "MinIO",
  "redis-server": "Redis",
  "vi-smart-api": "API Server",
};

function Gauge({
  value,
  label,
  color,
  subtitle,
}: {
  value: number;
  label: string;
  color: string;
  subtitle?: string;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          className="transition-all duration-500"
        />
        <text
          x="48"
          y="46"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e2e8f0"
          fontSize="18"
          fontWeight="bold"
        >
          {Math.round(value)}%
        </text>
        {subtitle && (
          <text x="48" y="64" textAnchor="middle" fill="#64748b" fontSize="9">
            {subtitle}
          </text>
        )}
      </svg>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color} bg-opacity-15`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function ServiceCard({
  name,
  status,
  cpu,
  memory,
}: {
  name: string;
  status: "running" | "stopped" | "error";
  cpu: string;
  memory: string;
}) {
  const Icon = SERVICE_ICONS[name] || Server;
  const label = SERVICE_LABELS[name] || name;
  const isOk = status === "running";

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isOk
          ? "border-slate-700/50 bg-slate-800/50"
          : "border-red-900/50 bg-red-950/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-md ${
              isOk ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOk ? (
                <Wifi className="h-3 w-3 text-emerald-400" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  isOk ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isOk ? "Running" : status === "stopped" ? "Stopped" : "Error"}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          {cpu !== "-" && <p>CPU: {cpu}</p>}
          {memory !== "-" && <p>MEM: {memory}</p>}
        </div>
      </div>
    </div>
  );
}

export default function VPSMonitorPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, storageRes] = await Promise.all([
        fetch(`${API_BASE}/system-stats`, {
          headers: { "x-api-secret": API_SECRET },
          next: { revalidate: 0 },
        }),
        fetch(`${API_BASE}/storage-stats`, {
          headers: { "x-api-secret": API_SECRET },
          next: { revalidate: 0 },
        }).catch(() => null),
      ]);

      if (!statsRes.ok) {
        throw new Error(`VPS API returned ${statsRes.status}`);
      }

      const statsData: SystemStats = await statsRes.json();
      setStats(statsData);

      if (storageRes && storageRes.ok) {
        const storageData: StorageStats = await storageRes.json();
        setStorage(storageData);
      }

      setError("");
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch VPS stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleRefresh = () => {
    setLoading(true);
    fetchAll();
  };

  const formatUptime = (uptime: string) => {
    const match = uptime.match(/(\d+)\s*:\s*(\d+)/);
    if (match) {
      const h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const d = Math.floor(h / 24);
      const remainingH = h % 24;
      if (d > 0) return `${d}d ${remainingH}h ${m}m`;
      return `${h}h ${m}m`;
    }
    return uptime;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Connecting to VPS...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <WifiOff className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">VPS Unreachable</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Monitor className="h-6 w-6 text-emerald-400" />
            VPS Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time server health &mdash; auto-refreshes every 30s
            {lastFetched && (
              <span className="ml-2 text-xs text-slate-500">
                Last updated: {lastFetched.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Now"}
        </button>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 flex justify-center">
          <Gauge
            value={stats?.cpu.usage ?? 0}
            label="CPU Usage"
            color="#10b981"
            subtitle={
              stats
                ? `${stats.cpu.load_1?.toFixed(2) ?? "-"} / ${stats.cpu.cores ?? "-"} cores`
                : undefined
            }
          />
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 flex justify-center">
          <Gauge
            value={stats?.memory.percent ?? 0}
            label="Memory Usage"
            color="#8b5cf6"
            subtitle={
              stats
                ? `${(stats.memory.used / 1024).toFixed(1)} / ${(stats.memory.total / 1024).toFixed(1)} GB`
                : undefined
            }
          />
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 flex justify-center">
          <Gauge
            value={stats?.disk.percent ?? 0}
            label="Disk Usage"
            color="#f59e0b"
            subtitle={
              stats
                ? `${stats.disk.used?.toFixed(1) ?? "-"} / ${stats.disk.total?.toFixed(1) ?? "-"} GB`
                : undefined
            }
          />
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Clock}
            label="Uptime"
            value={formatUptime(stats.uptime)}
            color="bg-cyan-500"
          />
          <StatCard
            icon={Cpu}
            label="CPU Cores"
            value={String(stats.cpu.cores ?? "-")}
            color="bg-emerald-500"
          />
          <StatCard
            icon={Film}
            label="Active Recordings"
            value={String(storage?.recordings?.count ?? 0)}
            color="bg-violet-500"
          />
          <StatCard
            icon={Disc}
            label="Recording Storage"
            value={`${(storage?.recordings?.size_gb ?? 0).toFixed(1)} GB`}
            color="bg-amber-500"
          />
        </div>
      )}

      {/* Memory & Disk Details */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-400" />
              Memory
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Total", value: `${(stats.memory.total / 1024).toFixed(1)} GB` },
                { label: "Used", value: `${(stats.memory.used / 1024).toFixed(1)} GB` },
                { label: "Free", value: `${((stats.memory.total - stats.memory.used) / 1024).toFixed(1)} GB` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-200 font-medium">{row.value}</span>
                </div>
              ))}
              {/* Mini bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${stats.memory.percent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-amber-400" />
              Disk
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Total", value: `${stats.disk.total?.toFixed(1) ?? "-"} GB` },
                { label: "Used", value: `${stats.disk.used?.toFixed(1) ?? "-"} GB` },
                { label: "Available", value: `${stats.disk.free?.toFixed(1) ?? ((stats.disk.total - stats.disk.used)?.toFixed(1))} GB` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-200 font-medium">{row.value}</span>
                </div>
              ))}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${stats.disk.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services */}
      {stats && stats.services && stats.services.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.services.map((svc) => (
              <ServiceCard
                key={svc.name}
                name={svc.name}
                status={svc.status}
                cpu={svc.cpu}
                memory={svc.memory}
              />
            ))}
          </div>
        </div>
      )}

      {/* Storage Details */}
      {storage && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Disc className="h-4 w-4 text-cyan-400" />
            Recording Storage
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Recordings</p>
              <p className="text-slate-200 font-semibold text-lg">
                {storage.recordings?.count ?? 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Size</p>
              <p className="text-slate-200 font-semibold text-lg">
                {(storage.recordings?.size_gb ?? 0).toFixed(2)} GB
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Uploads</p>
              <p className="text-slate-200 font-semibold text-lg">
                {storage.uploads?.count ?? 0} files
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
