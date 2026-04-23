/**
 * AdminDashboard.tsx
 * Main analytics overview — KPI cards, charts, recent activity feed.
 * Brand palette: #86B537 (green), #509CD1 (sky), #108ACB (blue)
 * No pink colors used - replaced with sky/blue tones.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Users, CalendarDays, Clock, Trash2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as HBarChart,
  Bar as HBar,
  Area,
  AreaChart,
} from "recharts";
import { StatCard } from "../../../components/admin/StatCard";
import { adminApiService } from "../../../services/adminApiService";
import type { PlatformStats } from "../../../types/admin.types";
import type {
  EventData,
  EventLog,
  LeaderboardEntry,
} from "../../../types/apiTypes";
import { formatDistanceToNow, format } from "date-fns";

function groupEventsByMonth(events: EventData[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    const month = format(new Date(e.createdAt), "MMM yy");
    counts[month] = (counts[month] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([month, count]) => ({ month, count }))
    .slice(-8);
}

function groupLogsByDate(logs: EventLog[]) {
  const sums: Record<string, number> = {};
  logs
    .filter((l) => l.checkOutTime)
    .forEach((l) => {
      const day = format(new Date(l.checkInTime), "dd MMM");
      sums[day] = (sums[day] ?? 0) + (l.garbageWeight || 0);
    });
  return Object.entries(sums)
    .map(([date, kg]) => ({ date, kg: Math.round(kg * 10) / 10 }))
    .slice(-10);
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [recentLogs, setRecentLogs] = useState<EventLog[]>([]);
  const [topContributors, setTopContributors] = useState<LeaderboardEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [platformStats, allEvents, leaderboard] = await Promise.all([
        adminApiService.getPlatformStats(),
        adminApiService.getAllEvents(),
        adminApiService.getTopLeaderboard(5),
      ]);
      setStats(platformStats);
      setEvents(allEvents);
      setTopContributors(leaderboard);

      const recentEvents = [...allEvents]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      const logsArrays = await Promise.all(
        recentEvents.map((e) => adminApiService.getLogsByEvent(e.eventId)),
      );
      const merged = logsArrays
        .flat()
        .sort(
          (a, b) =>
            new Date(b.checkInTime).getTime() -
            new Date(a.checkInTime).getTime(),
        )
        .slice(0, 12);
      setRecentLogs(merged);
    } catch (err) {
      console.error("AdminDashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const eventsByMonth = groupEventsByMonth(events);
  const wasteOverTime = groupLogsByDate(recentLogs);

  return (
    <div className="animate-slide-up space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F2540] tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Platform-wide overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          subtext="Registered volunteers"
          icon={<Users size={20} />}
          borderColor="#108ACB"
          iconBg="#E6F3FB"
          iconColor="#108ACB"
          loading={loading}
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents ?? 0}
          subtext={`${stats?.totalEvents ?? 0} total events`}
          icon={<CalendarDays size={20} />}
          borderColor="#86B537"
          iconBg="#F0F7E4"
          iconColor="#86B537"
          loading={loading}
        />
        <StatCard
          label="Total Clean-up Hours"
          value={stats ? `${stats.totalHoursLogged}h` : "0h"}
          subtext="Across all sessions"
          icon={<Clock size={20} />}
          borderColor="#509CD1"
          iconBg="#E8F2FA"
          iconColor="#509CD1"
          loading={loading}
        />
        <StatCard
          label="Total Waste Collected"
          value={stats ? `${stats.totalWasteCollected} kg` : "0 kg"}
          subtext="All garbage bagged"
          icon={<Trash2 size={20} />}
          borderColor="#86B537"
          iconBg="#F0F7E4"
          iconColor="#86B537"
          loading={loading}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Charts column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Events by Month */}
          <div className="bg-white rounded-2xl border border-[#E8EEF4] p-5 transition hover:shadow-[0_14px_40px_-22px_rgba(16,37,64,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F2540] tracking-tight">
                  Events by Month
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Events created over time
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#E6F3FB", color: "#108ACB" }}
              >
                <TrendingUp size={15} />
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-slate-100 rounded-xl animate-pulse" />
            ) : eventsByMonth.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-400 text-sm font-medium">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={196}>
                <BarChart
                  data={eventsByMonth}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  barCategoryGap={18}
                >
                  <defs>
                    <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#108ACB" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#509CD1"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="#EEF3F8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#F2F7FB" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E8EEF4",
                      boxShadow: "0 10px 30px -12px rgba(16,37,64,0.2)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barBlue)"
                    radius={[8, 8, 0, 0]}
                    name="Events"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Waste Collected Over Time */}
          <div className="bg-white rounded-2xl border border-[#E8EEF4] p-5 transition hover:shadow-[0_14px_40px_-22px_rgba(16,37,64,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F2540] tracking-tight">
                  Waste Collected (kg)
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Recent session outputs
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#F0F7E4", color: "#86B537" }}
              >
                <Trash2 size={15} />
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-slate-100 rounded-xl animate-pulse" />
            ) : wasteOverTime.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-400 text-sm font-medium">
                No session data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={196}>
                <AreaChart
                  data={wasteOverTime}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#86B537"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#86B537" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="#EEF3F8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E8EEF4",
                      boxShadow: "0 10px 30px -12px rgba(16,37,64,0.2)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="#86B537"
                    strokeWidth={2.5}
                    fill="url(#areaGreen)"
                  />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke="#86B537"
                    strokeWidth={2.5}
                    dot={{
                      fill: "#86B537",
                      r: 4,
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#86B537",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    name="Waste (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 5 Contributors - Using blue instead of pink */}
          <div className="bg-white rounded-2xl border border-[#E8EEF4] p-5 transition hover:shadow-[0_14px_40px_-22px_rgba(16,37,64,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#0F2540] tracking-tight">
                  Top 5 Contributors
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  By total hours logged
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#E8F2FA", color: "#108ACB" }}
              >
                <Users size={15} />
              </div>
            </div>
            {loading ? (
              <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            ) : topContributors.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm font-medium">
                No contributors yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <HBarChart
                  layout="vertical"
                  data={topContributors.map((u) => ({
                    name: u.userName?.split(" ")[0] ?? "User",
                    hours: Math.round(u.totalHours * 10) / 10,
                  }))}
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={10}
                >
                  <defs>
                    <linearGradient
                      id="barBlueGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#108ACB"
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor="#509CD1"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="#EEF3F8"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#475569", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                  />
                  <Tooltip
                    cursor={{ fill: "#E6F3FB", opacity: 0.35 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E8EEF4",
                      boxShadow: "0 10px 30px -12px rgba(16,37,64,0.2)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <HBar
                    dataKey="hours"
                    fill="url(#barBlueGradient)"
                    radius={[0, 8, 8, 0]}
                    name="Hours"
                  />
                </HBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-[#E8EEF4] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-base font-extrabold text-[#0F2540] tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Latest check-in sessions
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-2 text-center py-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#E8F2FA" }}
              >
                <Clock size={22} style={{ color: "#509CD1" }} />
              </div>
              <p className="text-[#0F2540] font-bold text-sm mt-1">
                No recent activity
              </p>
              <p className="text-slate-400 text-xs">
                Check-in sessions will appear here
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-1 overflow-y-auto -mx-1 px-1">
              {recentLogs.map((log, idx) => {
                const isCompleted = !!log.checkOutTime;
                const userInitial =
                  log.user?.name?.[0]?.toUpperCase() ??
                  log.userId?.[0]?.toUpperCase() ??
                  "U";
                const userName =
                  log.user?.name ?? `User ${log.userId?.slice(0, 6)}`;
                const eventName =
                  events.find((e) => e.eventId === log.eventId)?.name ??
                  log.event?.name ??
                  "Unknown Event";
                const timeAgo = formatDistanceToNow(new Date(log.checkInTime), {
                  addSuffix: true,
                });

                // Avatar colors - using theme colors without pink
                const avatarColors = [
                  "#108ACB",
                  "#86B537",
                  "#509CD1",
                  "#86B537",
                  "#108ACB",
                ];
                const avatarColor = avatarColors[idx % avatarColors.length];

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F6F8FB] transition-colors"
                  >
                    {/* Avatar - Solid color */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shadow-sm"
                      style={{ background: avatarColor }}
                    >
                      {userInitial}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-[#0F2540] truncate">
                          {userName}
                        </p>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                          style={{
                            background: isCompleted ? "#F0F7E4" : "#E8F2FA",
                            color: isCompleted ? "#86B537" : "#108ACB",
                          }}
                        >
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                        {eventName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {timeAgo}
                        </span>
                        {log.garbageWeight > 0 && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: "#86B537" }}
                            >
                              {log.garbageWeight}kg
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
