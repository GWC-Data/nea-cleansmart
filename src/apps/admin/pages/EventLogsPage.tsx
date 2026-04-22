/**
 * EventLogsPage.tsx
 * Filterable activity logs across all events.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Clock,
  Trash2,
  Search,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { DataTable } from "../../../components/admin/DataTable";
import type { Column } from "../../../components/admin/DataTable";
import { adminApiService } from "../../../services/adminApiService";
import type { EventLog, EventData } from "../../../types/apiTypes";
import { format, formatDistanceToNow } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(ts: string | null | undefined) {
  if (!ts) return null;
  try {
    return format(new Date(ts), "dd MMM, HH:mm");
  } catch {
    return ts;
  }
}

function fmtDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getInitial(name?: string) {
  return name?.[0]?.toUpperCase() ?? "U";
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryBarProps {
  logs: EventLog[];
  loading: boolean;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ logs, loading }) => {
  const completedLogs = logs.filter((l) => l.checkOutTime);
  const totalHours = logs.reduce((s, l) => s + (l.totalHours || 0), 0);
  const totalWaste = logs.reduce((s, l) => s + (l.garbageWeight || 0), 0);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
          Total Logs
        </p>
        <p className="text-2xl font-black text-gray-900">{logs.length}</p>
        <p className="text-[10px] text-gray-400 font-medium">
          {completedLogs.length} completed
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
          Hours Logged
        </p>
        <p className="text-2xl font-black text-gray-900">
          {totalHours.toFixed(1)}
        </p>
        <p className="text-[10px] text-gray-400 font-medium">hours total</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
          Waste Collected
        </p>
        <p className="text-2xl font-black text-gray-900">
          {totalWaste.toFixed(1)}
        </p>
        <p className="text-[10px] text-gray-400 font-medium">kg total</p>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const EventLogsPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<EventLog[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed"
  >("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData] = await Promise.all([adminApiService.getAllEvents()]);
      setEvents(eventsData);

      // Fetch logs for all events
      const logsArrays = await Promise.all(
        eventsData.map((e) => adminApiService.getLogsByEvent(e.eventId)),
      );
      const merged = logsArrays
        .flat()
        .sort(
          (a, b) =>
            new Date(b.checkInTime).getTime() -
            new Date(a.checkInTime).getTime(),
        );
      setAllLogs(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered logs
  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      // Status
      if (statusFilter === "active" && log.checkOutTime) return false;
      if (statusFilter === "completed" && !log.checkOutTime) return false;

      // Event
      if (eventFilter !== "all" && log.eventId !== eventFilter) return false;

      // Date range
      if (dateFrom) {
        const checkIn = new Date(log.checkInTime);
        if (checkIn < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const checkIn = new Date(log.checkInTime);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (checkIn > toDate) return false;
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        const userName = log.user?.name ?? "";
        const eventName = log.event?.name ?? "";
        if (
          !userName.toLowerCase().includes(q) &&
          !eventName.toLowerCase().includes(q)
        )
          return false;
      }

      return true;
    });
  }, [allLogs, statusFilter, eventFilter, dateFrom, dateTo, search]);

  // Table columns
  const columns: Column<EventLog & Record<string, unknown>>[] = [
    {
      key: "_idx",
      label: "#",
      width: "48px",
      render: (_row, index) => (
        <span className="text-gray-400 font-bold text-xs">{index + 1}</span>
      ),
    },
    {
      key: "_user",
      label: "User",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0"
            style={{ background: "#08351e" }}
          >
            {getInitial(row.user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-xs truncate">
              {row.user?.name ?? `User ${String(row.userId).slice(0, 6)}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "_event",
      label: "Event",
      render: (row) => (
        <span className="text-gray-600 font-medium text-xs truncate max-w-[140px] block">
          {row.event?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "checkInTime",
      label: "Check-in",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600 text-xs font-medium">
          {fmtTime(String(row.checkInTime))}
        </span>
      ),
    },
    {
      key: "checkOutTime",
      label: "Check-out",
      render: (row) => {
        if (row.checkOutTime) {
          return (
            <span className="text-gray-600 text-xs font-medium">
              {fmtTime(String(row.checkOutTime))}
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: "#25935f" }}
            />
            Active
          </span>
        );
      },
    },
    {
      key: "totalHours",
      label: "Duration",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
          <Clock size={11} className="text-gray-400" />
          {row.totalHours ? fmtDuration(Number(row.totalHours)) : "—"}
        </div>
      ),
    },
    {
      key: "garbageWeight",
      label: "Waste",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
          <Trash2 size={11} className="text-gray-400" />
          {row.garbageWeight ? `${row.garbageWeight} kg` : "—"}
          {row.garbageType ? (
            <span className="text-[10px] text-gray-400 capitalize">
              ({String(row.garbageType)})
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "eventLocation",
      label: "Location",
      render: (row) => (
        <span className="text-gray-400 text-xs font-medium truncate max-w-[100px] block">
          {row.eventLocation
            ? String(row.eventLocation).slice(0, 25) +
              (String(row.eventLocation).length > 25 ? "…" : "")
            : "—"}
        </span>
      ),
    },
    {
      key: "_time",
      label: "When",
      render: (row) => (
        <span className="text-gray-400 text-[10px] font-medium whitespace-nowrap">
          {formatDistanceToNow(new Date(String(row.checkInTime)), {
            addSuffix: true,
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-slide-up space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Activity Logs
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            All check-in/check-out sessions across events
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
          id="refresh-logs-btn"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryBar logs={filtered} loading={loading} />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or event…"
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              id="logs-search"
            />
          </div>

          {/* Event selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-gray-400 shrink-0" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition bg-white"
              id="logs-event-filter"
            >
              <option value="all">All Events</option>
              {events.map((e) => (
                <option key={e.eventId} value={e.eventId}>
                  {e.name.slice(0, 30)}
                  {e.name.length > 30 ? "…" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {(["all", "active", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                  statusFilter === s
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={
                  statusFilter === s
                    ? {
                        background:
                          s === "active"
                            ? "#25935f"
                            : s === "completed"
                              ? "#107acc"
                              : "#0f4772",
                      }
                    : {}
                }
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              id="logs-date-from"
            />
            <span className="text-gray-400 text-xs font-medium">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              id="logs-date-to"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(r) => String(r["id"])}
        loading={loading}
        emptyIcon="🗒️"
        emptyText="No logs found"
        emptySubtext="Adjust your filters to see results."
      />
    </div>
  );
};
