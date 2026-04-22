/**
 * UserDetailModal.tsx
 * View user profile, stats, joined events, group and badge progress.
 */

import React from "react";
import {
  X,
  Mail,
  User,
  CalendarDays,
  Users,
  Award,
  Clock,
  Trash2,
} from "lucide-react";
import type { UserProfile } from "../../types/apiTypes";
import type { LeaderboardEntry } from "../../types/apiTypes";
import { format } from "date-fns";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  leaderboardEntry?: LeaderboardEntry | null;
}

// Badge progression thresholds (based on hours)
function getBadgeInfo(totalHours: number) {
  if (totalHours >= 150) return { current: "Diamond", next: null, progress: 100, color: "#60a5fa" };
  if (totalHours >= 100) return { current: "Gold", next: "Diamond", progress: Math.round(((totalHours - 100) / 50) * 100), color: "#f59e0b" };
  if (totalHours >= 50) return { current: "Silver", next: "Gold", progress: Math.round(((totalHours - 50) / 50) * 100), color: "#9ca3af" };
  return { current: "Bronze", next: "Silver", progress: Math.round((totalHours / 50) * 100), color: "#c97e3e" };
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#dbeafe", text: "#1d4ed8" },
  volunteer: { bg: "#dcfce7", text: "#15803d" },
  user: { bg: "#dcfce7", text: "#15803d" },
};

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  leaderboardEntry,
}) => {
  if (!isOpen || !user) return null;

  const roleStyle = ROLE_STYLES[user.role?.toLowerCase()] || ROLE_STYLES.user;
  const totalHours = leaderboardEntry?.totalHours ?? 0;
  const totalWaste = leaderboardEntry?.garbageWeightCollected ?? 0;
  const badgeInfo = getBadgeInfo(totalHours);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = user.createdAt
    ? format(new Date(user.createdAt), "dd MMM yyyy")
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto scale-in-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top banner */}
        <div
          className="relative h-24 rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #0f4772 0%, #1d7fc4 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            id="user-detail-close"
          >
            <X size={18} />
          </button>

          {/* Avatar */}
          <div
            className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg border-4 border-white"
            style={{ background: "#08351e" }}
          >
            {initials}
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 px-6 pb-6">
          {/* Name + Role */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize"
                  style={{ background: roleStyle.bg, color: roleStyle.text }}
                >
                  {user.role}
                </span>
                {user.group && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Users size={11} />
                    {user.group.groupName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Profile Info ── */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-[#107acc]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                <p className="font-semibold text-gray-700">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <User size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Age</p>
                  <p className="font-bold text-gray-700">{user.age ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <User size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender</p>
                  <p className="font-bold text-gray-700 capitalize">{user.gender ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <CalendarDays size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</p>
                  <p className="font-bold text-gray-700">{joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <Clock size={16} className="mx-auto text-[#107acc] mb-1" />
              <p className="text-xl font-black text-gray-900">{totalHours.toFixed(1)}</p>
              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Hours</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <Trash2 size={16} className="mx-auto text-[#25935f] mb-1" />
              <p className="text-xl font-black text-gray-900">{totalWaste.toFixed(1)}</p>
              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">kg Waste</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-3 text-center">
              <Users size={16} className="mx-auto text-amber-600 mb-1" />
              <p className="text-xl font-black text-gray-900">
                {user.joinedEvents?.length ?? 0}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Events</p>
            </div>
          </div>

          {/* ── Badge Progress ── */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={15} style={{ color: badgeInfo.color }} />
                <span className="text-sm font-black text-gray-800">{badgeInfo.current} Badge</span>
              </div>
              {badgeInfo.next && (
                <span className="text-xs text-gray-400 font-medium">
                  Next: <span className="font-bold text-gray-600">{badgeInfo.next}</span>
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${badgeInfo.progress}%`,
                  background: badgeInfo.color,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1.5">
              {totalHours.toFixed(1)} hours logged
              {badgeInfo.next && ` · ${(Math.ceil(totalHours / 50) * 50 - totalHours).toFixed(1)}h to ${badgeInfo.next}`}
            </p>
          </div>

          {/* ── Joined Events ── */}
          {user.joinedEvents && user.joinedEvents.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Joined Events ({user.joinedEvents.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {user.joinedEvents.map((evId) => (
                  <div
                    key={evId}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "#96c93d" }}
                    />
                    <span className="text-xs font-medium text-gray-600 font-mono">{evId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
