/**
 * UsersPage.tsx
 * Professional user management view with elegant theme-based styling.
 * Theme colors: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Filter, UserPlus } from "lucide-react";
import { DataTable } from "../../../components/sections/admin/DataTable";
import type { Column } from "../../../components/sections/admin/DataTable";
import { UserDetailModal } from "../../../components/sections/admin/modal/UserDetailModal";
import { adminApiService } from "../../../services/adminApiService";
import type { UserProfile, LeaderboardEntry } from "../../../types/api.types";
import { format } from "date-fns";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#E8F2FA", text: "#108ACB" },
  volunteer: { bg: "#F0F7E4", text: "#86B537" },
  user: { bg: "#F0F7E4", text: "#86B537" },
};

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
      console.log("userData", usersData);
      setUsers(usersData);
      setLeaderboard(lbData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lbMap = useMemo(
    () => new Map(leaderboard.map((e) => [e.userId, e])),
    [leaderboard],
  );

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

  const columns: Column<UserProfile & Record<string, unknown>>[] = [
    {
      key: "_idx",
      label: "#",
      width: "48px",
      render: (_row, index) => (
        <span className="text-[#A0AAB5] font-medium text-xs">{index + 1}</span>
      ),
    },
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex bg-[#108acb] items-center justify-center font-semibold text-xs text-white shrink-0">
            {getInitials(row.name)}
          </div>
          <div>
            <p className="font-semibold text-[#1A2A3A] text-sm">{row.name}</p>
            <p className="text-[11px] text-[#8A9AA8]">{row.email}</p>
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
            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium capitalize"
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
        <span className="text-[#6B7A88] font-medium text-sm">
          {row.age ?? "—"}
        </span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => (
        <span className="text-[#6B7A88] font-medium text-sm capitalize">
          {row.gender ?? "—"}
        </span>
      ),
    },
    // {
    //   key: "_events",
    //   label: "Events",
    //   render: (row) => (
    //     <span className="text-[#6B7A88] font-medium text-sm">
    //       {row.joinedEvents?.length ?? 0}
    //     </span>
    //   ),
    // },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => (
        <span className="text-[#8A9AA8] text-xs font-medium">
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
          className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
          style={{ background: "#E8F2FA", color: "#108ACB" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#D4EAF8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#E8F2FA";
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
            Users
          </h1>
          <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
            {loading ? "Loading..." : `${users.length} registered users`}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "#86B537", color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#75A030";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#86B537";
          }}
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E8EDF2] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1">
            <Filter size={13} className="text-[#8A9AA8]" />
            {(["all", "volunteer", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  roleFilter === r
                    ? "text-white"
                    : "bg-[#F5F7FA] text-[#6B7A88] hover:bg-[#E8EDF2]"
                }`}
                style={roleFilter === r ? { background: "#108ACB" } : {}}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-1">
            {(["all", "male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  genderFilter === g
                    ? "text-white"
                    : "bg-[#F5F7FA] text-[#6B7A88] hover:bg-[#E8EDF2]"
                }`}
                style={genderFilter === g ? { background: "#86B537" } : {}}
              >
                {g === "all" ? "All Genders" : g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results summary */}
      {!loading && search && (
        <p className="text-xs text-[#8A9AA8] font-medium px-1">
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
        // emptyIcon={
        //   <div className="flex flex-col items-center">
        //     <div className="w-15 h-15 rounded-full flex items-center justify-center" style={{ background: "#F5F7FA" }}>
        //       <Users size={32} style={{ color: "#A0AAB5" }} />
        //     </div>
        //   </div>
        // }
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
