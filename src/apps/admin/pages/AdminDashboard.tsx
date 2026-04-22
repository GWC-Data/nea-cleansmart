/**
 * AdminDashboard.tsx
 * Main analytics overview — KPI cards, charts, recent activity feed.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Users, CalendarDays, Clock, Trash2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as HBarChart,
  Bar as HBar,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

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

      // Fetch logs for the most recent 5 events
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
  console.log("eventsByMonth", eventsByMonth);
  console.log("events", events);
  // events
  //   {
  //     "eventId": "324284b7-f7c5-4bee-ad9c-2ac70cf7e4c2",
  //     "date": "2026-05-20T00:00:00.000Z",
  //     "location": "Remote",
  //     "name": "15-Hour ​Clean-up Challenge",
  //     "details": "1 clean-up (minimum 30\nminutes to maximum 2 hours)​",
  //     "description": "We all have a hand in keeping Singapore clean. Join us in completing 15 hours of clean-up activities throughout 2026. This is more than just a clean-up initiative—make a meaningful difference today, enjoy yourself, and become part of Singapore's continuing story of cleanliness and community pride.​",
  //     "rewards": "All members who complete 15 hours of clean-up activities in 2026 will receive an attractive premium from PHC. Terms and conditions apply.​",
  //     "joinsCount": 4,
  //     "participants": [
  //         "09644a53-05f4-472c-a785-51ef2ccadb7e",
  //         "c9cdc04a-cd02-42d9-8203-93f5a859ecc7",
  //         "9458d695-b96b-4870-a479-5de052a5a5f2",
  //         "0aff07f1-838a-46eb-89af-c1dd07171291"
  //     ],
  //     "event_image": "uploads\\event_images\\event-image-1776328008261-254475743.png",
  //     "createdAt": "2026-04-16T08:26:48.000Z",
  //     "updatedAt": "2026-04-17T08:38:55.000Z",
  //     "eventImage": "uploads\\event_images\\event-image-1776328008261-254475743.png"
  // }
  const wasteOverTime = groupLogsByDate(recentLogs);
  console.log("wasteOverTime", wasteOverTime);
  console.log("recentLogs", recentLogs);
  // recentLogs
  //   [{
  //     "id": 14,
  //     "eventId": "324284b7-f7c5-4bee-ad9c-2ac70cf7e4c2",
  //     "userId": "09644a53-05f4-472c-a785-51ef2ccadb7e",
  //     "groupId": null,
  //     "checkInTime": "2026-04-17T11:16:52.000Z",
  //     "checkOutTime": "2026-04-17T11:18:17.000Z",
  //     "totalHours": 0.0237861,
  //     "garbageWeight": 1,
  //     "hoursEnrolled": "0.5",
  //     "garbageType": "Cigarette butts, Packet/canned drinks",
  //     "eventLocation": "tpt",
  //     "wasteImage": null,
  //     "createdAt": "2026-04-17T11:16:52.000Z",
  //     "updatedAt": "2026-04-17T11:18:17.000Z",
  //     "user": {
  //         "id": "09644a53-05f4-472c-a785-51ef2ccadb7e",
  //         "name": "Bharath Sevarkodiyon",
  //         "email": "bharathsan2000@gmail.com",
  //         "role": "admin"
  //     },
  //     "group": null
  // }]
  return (
    <div className="animate-slide-up space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 font-medium mt-0.5">
          Platform-wide overview
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          subtext="Registered volunteers"
          icon={<Users size={20} />}
          borderColor="#107acc"
          iconBg="#eff6ff"
          iconColor="#107acc"
          loading={loading}
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents ?? 0}
          subtext={`${stats?.totalEvents ?? 0} total events`}
          icon={<CalendarDays size={20} />}
          borderColor="#25935f"
          iconBg="#f0fdf4"
          iconColor="#25935f"
          loading={loading}
        />
        <StatCard
          label="Total Clean-up Hours"
          value={stats ? `${stats.totalHoursLogged}h` : "0h"}
          subtext="Across all sessions"
          icon={<Clock size={20} />}
          borderColor="#eab308"
          iconBg="#fefce8"
          iconColor="#ca8a04"
          loading={loading}
        />
        <StatCard
          label="Total Waste Collected"
          value={stats ? `${stats.totalWasteCollected} kg` : "0 kg"}
          subtext="All garbage bagged"
          icon={<Trash2 size={20} />}
          borderColor="#96c93d"
          iconBg="#f7fee7"
          iconColor="#65a30d"
          loading={loading}
        />
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Charts column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Events by Month */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Events by Month
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Events created over time
                </p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50">
                <TrendingUp size={15} className="text-[#107acc]" />
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            ) : eventsByMonth.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <BarChart
                  data={eventsByMonth}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#107acc"
                    radius={[6, 6, 0, 0]}
                    name="Events"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Waste Collected Over Time */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Waste Collected (kg)
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  Recent session outputs
                </p>
              </div>
              <div className="p-2 rounded-xl" style={{ background: "#f7fee7" }}>
                <Trash2 size={15} style={{ color: "#65a30d" }} />
              </div>
            </div>
            {loading ? (
              <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            ) : wasteOverTime.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
                No session data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <LineChart
                  data={wasteOverTime}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke="#96c93d"
                    strokeWidth={2.5}
                    dot={{ fill: "#96c93d", r: 4, strokeWidth: 0 }}
                    name="Waste (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 5 Contributors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 tracking-tight">
                  Top 5 Contributors
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  By total hours logged
                </p>
              </div>
              <div className="p-2 rounded-xl bg-green-50">
                <Users size={15} className="text-[#25935f]" />
              </div>
            </div>
            {loading ? (
              <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ) : topContributors.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                No contributors yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <HBarChart
                  layout="vertical"
                  data={topContributors.map((u) => ({
                    name: u.userName?.split(" ")[0] ?? "User",
                    hours: Math.round(u.totalHours * 10) / 10,
                  }))}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                  <HBar
                    dataKey="hours"
                    fill="#25935f"
                    radius={[0, 6, 6, 0]}
                    name="Hours"
                  />
                </HBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Recent Activity Feed ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Latest check-in sessions
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-2 text-center">
              <span className="text-3xl">📋</span>
              <p className="text-gray-500 font-bold text-sm">
                No recent activity
              </p>
              <p className="text-gray-400 text-xs">
                Check-in sessions will appear here
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto">
              {recentLogs.map((log) => {
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

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0"
                      style={{ background: "#08351e" }}
                    >
                      {userInitial}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {userName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate font-medium">
                        {eventName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {timeAgo}
                        </span>
                        {log.garbageWeight > 0 && (
                          <span className="text-[10px] text-gray-400">
                            · {log.garbageWeight}kg
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Status dot */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        isCompleted ? "" : "animate-pulse-dot"
                      }`}
                      style={{
                        background: isCompleted ? "#25935f" : "#eab308",
                      }}
                    />
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
