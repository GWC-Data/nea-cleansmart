/**
 * UserDetailModal.tsx
 * Professional user profile modal with stats, badge progress, and event history.
 */

import React from "react";
import { X, Mail, User, CalendarDays, Users, Award, Clock, Trash2 } from "lucide-react";
import type { UserProfile } from "../../types/apiTypes";
import type { LeaderboardEntry } from "../../types/apiTypes";
import { format } from "date-fns";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  leaderboardEntry?: LeaderboardEntry | null;
}

function getBadgeInfo(totalHours: number) {
  if (totalHours >= 150) return { current: "Diamond", next: null, progress: 100, color: "#509CD1" };
  if (totalHours >= 100) return { current: "Gold", next: "Diamond", progress: Math.round(((totalHours - 100) / 50) * 100), color: "#86B537" };
  if (totalHours >= 50) return { current: "Silver", next: "Gold", progress: Math.round(((totalHours - 50) / 50) * 100), color: "#A0AAB5" };
  return { current: "Bronze", next: "Silver", progress: Math.min(100, Math.round((totalHours / 50) * 100)), color: "#EC5594" };
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#E8F2FA", text: "#108ACB" },
  volunteer: { bg: "#F0F7E4", text: "#86B537" },
  user: { bg: "#F0F7E4", text: "#86B537" },
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

  const joinedDate = user.createdAt ? format(new Date(user.createdAt), "dd MMM yyyy") : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2A3A]/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top banner with theme gradient */}
        <div
          className="relative h-20 rounded-t-2xl"
          style={{ background: "linear-gradient(135deg, #0F2D3C 0%, #1A4A5F 100%)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X size={16} />
          </button>

          {/* Avatar */}
          <div
            className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md border-4 border-white"
            style={{ background: "linear-gradient(135deg, #86B537, #509CD1)" }}
          >
            {initials}
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-6 pb-6">
          {/* Name + Role */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium capitalize"
                  style={{ background: roleStyle.bg, color: roleStyle.text }}
                >
                  {user.role}
                </span>
                {user.group && (
                  <span className="flex items-center gap-1 text-xs text-[#8A9AA8] font-medium">
                    <Users size={11} />
                    {user.group.groupName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#E8F2FA] flex items-center justify-center shrink-0">
                <Mail size={14} style={{ color: "#108ACB" }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8]">Email</p>
                <p className="font-medium text-[#1A2A3A]">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] flex items-center justify-center shrink-0">
                  <User size={13} className="text-[#8A9AA8]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8]">Age</p>
                  <p className="font-semibold text-[#1A2A3A]">{user.age ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] flex items-center justify-center shrink-0">
                  <User size={13} className="text-[#8A9AA8]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8]">Gender</p>
                  <p className="font-semibold text-[#1A2A3A] capitalize">{user.gender ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] flex items-center justify-center shrink-0">
                  <CalendarDays size={13} className="text-[#8A9AA8]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8]">Joined</p>
                  <p className="font-semibold text-[#1A2A3A]">{joinedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl p-3 text-center" style={{ background: "#E8F2FA" }}>
              <Clock size={16} className="mx-auto" style={{ color: "#108ACB" }} />
              <p className="text-xl font-bold text-[#1A2A3A] mt-1">{totalHours.toFixed(1)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A88]">Hours</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "#F0F7E4" }}>
              <Trash2 size={16} className="mx-auto" style={{ color: "#86B537" }} />
              <p className="text-xl font-bold text-[#1A2A3A] mt-1">{totalWaste.toFixed(1)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A88]">kg Waste</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "#FDECF3" }}>
              <Users size={16} className="mx-auto" style={{ color: "#EC5594" }} />
              <p className="text-xl font-bold text-[#1A2A3A] mt-1">{user.joinedEvents?.length ?? 0}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7A88]">Events</p>
            </div>
          </div>

          {/* Badge Progress */}
          <div className="rounded-xl p-4 mb-5" style={{ background: "#F8F9FB" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={15} style={{ color: badgeInfo.color }} />
                <span className="text-sm font-semibold text-[#1A2A3A]">{badgeInfo.current} Badge</span>
              </div>
              {badgeInfo.next && (
                <span className="text-xs text-[#8A9AA8] font-medium">
                  Next: <span className="font-semibold text-[#6B7A88]">{badgeInfo.next}</span>
                </span>
              )}
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "#E8EDF2" }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${badgeInfo.progress}%`, background: badgeInfo.color }}
              />
            </div>
            <p className="text-[11px] text-[#8A9AA8] font-medium mt-1.5">
              {totalHours.toFixed(1)} hours logged
              {badgeInfo.next && ` · ${(Math.ceil(totalHours / 50) * 50 - totalHours).toFixed(1)}h to ${badgeInfo.next}`}
            </p>
          </div>

          {/* Joined Events */}
          {user.joinedEvents && user.joinedEvents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-2">
                Joined Events ({user.joinedEvents.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {user.joinedEvents.map((evId) => (
                  <div key={evId} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#F8F9FB" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#86B537" }} />
                    <span className="text-xs font-medium text-[#6B7A88] font-mono">{evId}</span>
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