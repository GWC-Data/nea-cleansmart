/**
 * EventLogsPage.tsx
 * Professional activity logs viewer with filtering and summary cards.
 * Theme colors: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Clock,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  List,
  Timer,
} from "lucide-react";
import { DataTable } from "../../../components/admin/DataTable";
import type { Column } from "../../../components/admin/DataTable";
import { adminApiService } from "../../../services/adminApiService";
import type { EventLog, EventData } from "../../../types/apiTypes";
import { format, formatDistanceToNow } from "date-fns";

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

// Summary Card Component
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
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#F5F7FA] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-[#E8EDF2] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9AA8]">
              Total Logs
            </p>
            <p className="text-2xl font-bold text-[#1A2A3A] mt-1">
              {logs.length}
            </p>
            <p className="text-[11px] text-[#86B537] font-medium mt-1">
              {completedLogs.length} completed
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#E8F2FA" }}
          >
            <List size={18} style={{ color: "#108ACB" }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF2] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9AA8]">
              Hours Logged
            </p>
            <p className="text-2xl font-bold text-[#1A2A3A] mt-1">
              {totalHours.toFixed(1)}
            </p>
            <p className="text-[11px] text-[#86B537] font-medium mt-1">
              hours total
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#F0F7E4" }}
          >
            <Timer size={18} style={{ color: "#86B537" }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF2] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A9AA8]">
              Waste Collected
            </p>
            <p className="text-2xl font-bold text-[#1A2A3A] mt-1">
              {totalWaste.toFixed(1)}
            </p>
            <p className="text-[11px] text-[#86B537] font-medium mt-1">
              kg total
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#F0F7E4" }}
          >
            <Trash2 size={18} style={{ color: "#86B537" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const EventLogsPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<EventLog[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed"
  >("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const eventsData = await adminApiService.getAllEvents();
      setEvents(eventsData);

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

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (statusFilter === "active" && log.checkOutTime) return false;
      if (statusFilter === "completed" && !log.checkOutTime) return false;
      if (eventFilter !== "all" && log.eventId !== eventFilter) return false;

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

      if (search) {
        const q = search.toLowerCase();
        const userName = log.user?.name ?? "";
        const eventName = log.event?.name ?? "";
        if (
          !userName.toLowerCase().includes(q) &&
          !eventName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allLogs, statusFilter, eventFilter, dateFrom, dateTo, search]);

  const columns: Column<EventLog & Record<string, unknown>>[] = [
    {
      key: "_idx",
      label: "#",
      width: "48px",
      render: (_row, index) => (
        <span className="text-[#A0AAB5] font-medium text-xs">{index + 1}</span>
      ),
    },
    {
      key: "_user",
      label: "User",
      render: (row) => {
        // Use solid colors based on userId for consistent avatar colors - no pink
        const avatarColors = [
          "#86B537",
          "#108ACB",
          "#509CD1",
          "#86B537",
          "#108ACB",
        ];
        const colorIndex =
          (row.userId?.charCodeAt?.(0) || 0) % avatarColors.length;
        const avatarColor = avatarColors[colorIndex];

        return (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs text-white shrink-0"
              style={{ background: avatarColor }}
            >
              {getInitial(row.user?.name)}
            </div>
            <div>
              <p className="font-semibold text-[#1A2A3A] text-sm">
                {row.user?.name ?? `User ${String(row.userId).slice(0, 6)}`}
              </p>
              <p className="text-[10px] text-[#8A9AA8]">
                {row.user?.email?.slice(0, 20)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "_event",
      label: "Event",
      render: (row) => (
        <div>
          <p className="font-medium text-[#1A2A3A] text-sm max-w-[180px] truncate">
            {row.event?.name ?? "—"}
          </p>
          {row.eventLocation && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-[#8A9AA8]" />
              <span className="text-[10px] text-[#8A9AA8] truncate max-w-[150px]">
                {row.eventLocation}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "checkInTime",
      label: "Check-in",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-[#1A2A3A] text-sm font-sm whitespace-nowrap">
            {fmtTime(String(row.checkInTime))}
          </p>
          <p className="text-[10px] text-[#8A9AA8]">
            {formatDistanceToNow(new Date(String(row.checkInTime)), {
              addSuffix: true,
            })}
          </p>
        </div>
      ),
    },
    {
      key: "checkOutTime",
      label: "Status",
      render: (row) => {
        if (row.checkOutTime) {
          return (
            <div>
              <p className="text-[#1A2A3A] text-sm font-sm whitespace-nowrap">
                {fmtTime(String(row.checkOutTime))}
              </p>
              <span
                className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium mt-1"
                style={{ background: "#F0F7E4", color: "#86B537" }}
              >
                Completed
              </span>
            </div>
          );
        }
        return (
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: "#E8F2FA", color: "#108ACB" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#108ACB" }}
              />
              Active
            </span>
          </div>
        );
      },
    },
    {
      key: "totalHours",
      label: "Duration",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "#F5F7FA" }}
          >
            <Clock size={12} className="text-[#8A9AA8]" />
          </div>
          <span className="text-[#1A2A3A] font-sm text-sm">
            {row.totalHours ? fmtDuration(Number(row.totalHours)) : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "garbageWeight",
      label: "Waste",
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "#F5F7FA" }}
            >
              <Trash2 size={12} className="text-[#8A9AA8]" />
            </div>
            <span className="text-[#1A2A3A] font-sm text-sm">
              {row.garbageWeight ? `${row.garbageWeight} kg` : "—"}
            </span>
          </div>
          {row.garbageType && (
            <p className="text-[10px] text-[#8A9AA8] mt-0.5 capitalize">
              {String(row.garbageType)}
            </p>
          )}
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setEventFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    eventFilter !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
            Activity Logs
          </h1>
          <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
            Track all volunteer check-ins, hours, and waste collection
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E8EDF2] text-[#6B7A88] text-sm font-medium hover:bg-[#F5F7FA] transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryBar logs={filtered} loading={loading} />

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-[#E8EDF2]">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user or event name..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
              />
            </div>

            {/* Event Filter */}
            <div className="relative">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="py-2 pl-9 pr-8 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] focus:outline-none focus:border-[#509CD1] transition-colors appearance-none bg-white"
              >
                <option value="all">All Events</option>
                {events.map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {e.name.length > 25 ? e.name.slice(0, 25) + "..." : e.name}
                  </option>
                ))}
              </select>
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5] pointer-events-none"
              />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8EDF2] text-[#6B7A88] text-sm font-medium hover:bg-[#F5F7FA] transition-colors"
            >
              <Filter size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#108ACB" }}
                />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium transition-colors"
                style={{ color: "#108ACB" }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E8EDF2]">
              <div className="flex flex-wrap items-center gap-4">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#8A9AA8]">
                    Status:
                  </span>
                  <div className="flex gap-1">
                    {(["all", "active", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                          statusFilter === s
                            ? "text-white"
                            : "bg-[#F5F7FA] text-[#6B7A88] hover:bg-[#E8EDF2]"
                        }`}
                        style={
                          statusFilter === s ? { background: "#108ACB" } : {}
                        }
                      >
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#8A9AA8]">
                    Date:
                  </span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-[#E8EDF2] text-xs font-medium text-[#1A2A3A] focus:outline-none focus:border-[#509CD1] transition-colors"
                  />
                  <span className="text-xs text-[#8A9AA8]">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-[#E8EDF2] text-xs font-medium text-[#1A2A3A] focus:outline-none focus:border-[#509CD1] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-[#8A9AA8] font-medium px-1">
          Showing {filtered.length} log{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Logs Table */}
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(r) => String(r["id"])}
        loading={loading}
        // emptyIcon="📋"
        emptyText="No activity logs found"
        emptySubtext="Adjust your filters or check back later for volunteer activity."
      />
    </div>
  );
};

export default EventLogsPage;
