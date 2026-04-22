/**
 * UsersPage.tsx
 * View, search, and filter all users. Click to open user detail modal.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DataTable } from "../../../components/admin/DataTable";
import type { Column } from "../../../components/admin/DataTable";
import { UserDetailModal } from "../../../components/admin/UserDetailModal";
import { adminApiService } from "../../../services/adminApiService";
import type { UserProfile, LeaderboardEntry } from "../../../types/apiTypes";
import { format } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#dbeafe", text: "#1d4ed8" },
  volunteer: { bg: "#dcfce7", text: "#15803d" },
  user: { bg: "#dcfce7", text: "#15803d" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "volunteer" | "admin">(
    "all",
  );
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all",
  );

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, lbData] = await Promise.all([
        adminApiService.getAllUsers(),
        adminApiService.getTopLeaderboard(999),
      ]);
      setUsers(usersData);
      setLeaderboard(lbData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build a userId → leaderboard entry map
  const lbMap = useMemo(
    () => new Map(leaderboard.map((e) => [e.userId, e])),
    [leaderboard],
  );

  // Filtered users
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole =
        roleFilter === "all" ||
        (roleFilter === "admin" ? u.role === "admin" : u.role !== "admin");
      const matchGender =
        genderFilter === "all" || u.gender?.toLowerCase() === genderFilter;
      return matchSearch && matchRole && matchGender;
    });
  }, [users, search, roleFilter, genderFilter]);

  // Table columns
  const columns: Column<UserProfile & Record<string, unknown>>[] = [
    {
      key: "_idx",
      label: "#",
      width: "48px",
      render: (_row, index) => (
        <span className="text-gray-400 font-bold text-xs">{index + 1}</span>
      ),
    },
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0"
            style={{ background: "#08351e" }}
          >
            {getInitials(row.name)}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{row.name}</p>
            <p className="text-[11px] text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => {
        const style = ROLE_STYLES[row.role?.toLowerCase()] ?? ROLE_STYLES.user;
        return (
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-black capitalize"
            style={{ background: style.bg, color: style.text }}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: "age",
      label: "Age",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600 font-medium text-sm">
          {row.age ?? "—"}
        </span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <span className="text-gray-600 font-medium text-sm capitalize">
          {row.gender ?? "—"}
        </span>
      ),
    },
    {
      key: "_hours",
      label: "Hours",
      sortable: false,
      render: (row) => {
        const lb = lbMap.get(row.id);
        return (
          <span className="text-gray-700 font-bold text-sm">
            {lb ? `${lb.totalHours.toFixed(1)}h` : "—"}
          </span>
        );
      },
    },
    {
      key: "_events",
      label: "Events",
      render: (row) => (
        <span className="text-gray-600 font-medium text-sm">
          {row.joinedEvents?.length ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => (
        <span className="text-gray-500 text-xs font-medium">
          {row.createdAt ? format(new Date(row.createdAt), "dd MMM yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "_action",
      label: "",
      width: "60px",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(row as UserProfile);
            setModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black text-[#107acc] bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="animate-slide-up space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Users
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            {loading ? "Loading…" : `${users.length} registered users`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              id="users-search"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1 shrink-0">
            <SlidersHorizontal size={13} className="text-gray-400" />
            {(["all", "volunteer", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                  roleFilter === r
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={roleFilter === r ? { background: "#0f4772" } : {}}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-1 shrink-0">
            {(["all", "male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                  genderFilter === g
                    ? "text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={genderFilter === g ? { background: "#25935f" } : {}}
              >
                {g === "all" ? "All Genders" : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results summary */}
      {!loading && search && (
        <p className="text-xs text-gray-400 font-medium px-1">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
          {search}"
        </p>
      )}

      {/* Table */}
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(r) => r["id"] as string}
        loading={loading}
        emptyIcon="👥"
        emptyText="No users found"
        emptySubtext="Adjust your search or filters."
        onRowClick={(r) => {
          setSelectedUser(r as unknown as UserProfile);
          setModalOpen(true);
        }}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        leaderboardEntry={
          selectedUser ? (lbMap.get(selectedUser.id) ?? null) : null
        }
      />
    </div>
  );
};
