import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Medal,
  Share2,
  Trophy,
  // Clock,
  Trash2,
} from "lucide-react";
import { apiService } from "../../../services/apiService";
import { useAuth } from "../../../hooks/useAuth";
import type {
  EventData,
  LeaderboardEntry,
  EventLeaderboard,
} from "../../../services/apiService";
import logo from "../../../assets/publicHygineCouncil.png";
import { toast } from "sonner";
import { getEventImageUrl } from "../../../utils/imageUtils";

const BADGES = [
  {
    label: "Silver",
    points: 50,
    hours: 5,
    color: "bg-[#bbf7d0]",
    border: "border-green-200",
    icon: "text-[#0a4527]",
    ring: "ring-green-400",
  },
  {
    label: "Gold",
    points: 100,
    hours: 10,
    color: "bg-[#fde68a]",
    border: "border-yellow-200",
    icon: "text-yellow-800",
    ring: "ring-yellow-400",
  },
  {
    label: "Diamond",
    points: 150,
    hours: 15,
    color: "bg-[#e2e8f0]",
    border: "border-slate-200",
    icon: "text-slate-700",
    ring: "ring-slate-400",
  },
];

// ── Rewards & Badges Card ────────────────────────────────────────────────────
const RewardsBadgesCard: React.FC<{
  rewards: string;
  earnedPoints: number;
}> = ({ rewards, earnedPoints }) => (
  <div className="bg-[#fcf8f2] rounded-[2rem] p-6 shadow-sm border border-orange-50/50">
    <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight mb-1">
      Rewards & Badges
    </h3>
    <p className="text-xs text-gray-400 font-medium mb-5 leading-relaxed">
      Complete clean-up hours to unlock badges and rewards.
    </p>
    <div className="flex flex-col gap-3">
      {BADGES.map((badge) => {
        const isEarned = earnedPoints >= badge.points;
        return (
          <div
            key={badge.label}
            className={`flex items-center gap-4 rounded-2xl px-4 py-3 border shadow-sm transition-all
    ${
      isEarned
        ? `${badge.color} border-transparent ring-2 ${badge.ring}`
        : "bg-white border-gray-100"
    }`}
          >
            <div
              className={`p-3 rounded-full border shrink-0
    ${
      isEarned
        ? "bg-white/60 " + badge.border
        : badge.color + " " + badge.border
    }`}
            >
              <Medal className={`w-5 h-5 ${badge.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-gray-800 text-sm">
                  {badge.label}
                </p>
                {isEarned && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.border} ${badge.icon} bg-white/70`}
                  >
                    ✓ Earned
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {badge.points} points · {badge.hours} hrs
              </p>
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-5 bg-white rounded-2xl px-4 py-3 border border-gray-100">
      <p className="text-xs text-gray-500 font-medium leading-relaxed">
        🎁 <span className="font-bold text-gray-700">Rewards: </span>
        {rewards}
      </p>
    </div>
  </div>
);

// ── Leaderboard Card ─────────────────────────────────────────────────────────
const LeaderboardCard: React.FC<{
  leaderboard: LeaderboardEntry[];
  currentUserId: number | null;
}> = ({ leaderboard, currentUserId }) => {
  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
        <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight mb-1 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
        </h3>
        <p className="text-xs text-gray-400 font-medium mt-3">
          No activity logged yet. Be the first!
        </p>
      </div>
    );
  }

  // const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
      <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
      </h3>
      <div className="flex flex-col gap-2">
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          // const hours = Math.floor(entry.totalHours);
          // const mins = Math.round((entry.totalHours - hours) * 60);

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                ${
                  isCurrentUser
                    ? "bg-[#f0fdf4] border-2 border-[#08351e] shadow-sm"
                    : "bg-gray-50 border border-gray-100"
                }`}
            >
              {/* Rank */}
              <div className="w-7 shrink-0 text-center">
                <span className="text-xs font-bold text-gray-400">
                  #{entry.rank}
                </span>
              </div>

              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0
                ${isCurrentUser ? "bg-[#08351e] text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {entry.userName.charAt(0).toUpperCase()}
              </div>

              {/* Name & hours */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-sm font-extrabold truncate ${isCurrentUser ? "text-[#08351e]" : "text-gray-800"}`}
                  >
                    {entry.userName}
                  </p>
                  {isCurrentUser && (
                    <span className="text-[9px] font-bold bg-[#08351e] text-white px-1.5 py-0.5 rounded-full shrink-0">
                      You
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  {entry.garbageWeightCollected}kg
                </p>
              </div>

              {/* Total hours badge */}
              <div
                className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0
                ${isCurrentUser ? "bg-[#08351e] text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {entry.totalHours.toFixed(2)}h
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Confirm Modal ────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  eventName: string;
  isJoining: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  eventName,
  isJoining,
  onCancel,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 lg:p-8 border-t-4 border-green-500 animate-in zoom-in-95">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
        Ready to Join? <span className="text-xl">🌱</span>
      </h2>
      <p className="text-gray-600 text-center font-medium mb-8">
        You're about to be part of the{" "}
        <span className="font-bold text-gray-800">{eventName}</span>! Here's to
        contributing to keeping Singapore clean!
      </p>
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          disabled={isJoining}
          className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isJoining}
          className="flex-1 py-3 bg-[#08351e] hover:bg-[#0a4527] text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </>
          ) : (
            "Yes, Join"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Success Modal ────────────────────────────────────────────────────────────
interface SuccessModalProps {
  eventName: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ eventName, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center border-t-4 border-green-500 animate-in zoom-in-95">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🎉</span>
      </div>
      <h2 className="text-2xl font-extrabold text-green-700 mb-2">
        You're In!
      </h2>
      <p className="text-gray-600 font-medium mb-8">
        Thank you for joining{" "}
        <span className="font-bold text-gray-800">{eventName}</span>!
      </p>
      <button
        onClick={onClose}
        className="w-full bg-[#08351e] hover:bg-[#0a4527] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
      >
        OK
      </button>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isLoading, refreshUserProfile } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<EventLeaderboard | null>(null);
  const [modalView, setModalView] = useState<"none" | "confirm" | "success">(
    "none",
  );
  const [isJoining, setIsJoining] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  //  Single combined effect — waits for auth before fetching
  // 1. Inside the useEffect — check what currentUser looks like when effect runs:
  useEffect(() => {
    if (isLoading) return;

    console.log("=== loadAll triggered ===");
    console.log("isLoading:", isLoading);
    console.log("currentUser:", currentUser);
    console.log("currentUser.joinedEvents:", currentUser?.joinedEvents);
    console.log("eventId param:", eventId);

    async function loadAll() {
      setDataLoading(true);
      try {
        const found = await apiService.getEventById(Number(eventId));
        setEvent(found);

        const userHasJoined =
          currentUser?.joinedEvents?.some((e: any) => {
            const id = typeof e === "number" ? e : e.eventId;
            return id === Number(eventId);
          }) ?? false;

        console.log("userHasJoined result:", userHasJoined);

        if (userHasJoined) {
          const lb = await apiService.getEventLeaderboard(Number(eventId));
          setLeaderboardData(lb);
        }
      } finally {
        setDataLoading(false);
      }
    }

    loadAll();
  }, [eventId, isLoading, currentUser]);

  //  Loading guard — BEFORE any derivations
  if (dataLoading || isLoading || !event)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium">
        Loading event...
      </div>
    );

  //  Safe to derive now — auth and event are both loaded
  const isActiveEvent =
    currentUser?.joinedEvents?.some((e: any) => {
      const id = typeof e === "number" ? e : e.eventId;
      return id === Number(eventId);
    }) ?? false;
  console.log(isActiveEvent);

  const earnedPoints = currentUser
    ? (() => {
        // Derive points from leaderboard entry for current user
        const myEntry = leaderboardData?.leaderboard.find(
          (e) => e.userId === currentUser.id,
        );
        // Approximate: each badge tier maps to hours
        if (!myEntry) return 0;
        if (myEntry.totalHours >= 15) return 150;
        if (myEntry.totalHours >= 10) return 100;
        if (myEntry.totalHours >= 5) return 50;
        return Math.floor(myEntry.totalHours * 10); // rough estimate
      })()
    : 0;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleConfirmJoin = async () => {
    setIsJoining(true);
    try {
      // Leave any currently active event first
      const currentActiveEvent = currentUser?.joinedEvents?.[0];
      if (currentActiveEvent) {
        const activeEventId = typeof currentActiveEvent === "number" ? currentActiveEvent : (currentActiveEvent as any).eventId;
        if (activeEventId !== event.eventId) {
          await apiService.leaveEvent(activeEventId);
        }
      }

      await apiService.joinEvent(event.eventId);
      await refreshUserProfile(); // refresh so isActiveEvent updates immediately
      const updated = await apiService.getEventById(event.eventId);
      if (updated) setEvent(updated);
      setModalView("success");
    } catch (error) {
      console.error("Failed to join event", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSuccessClose = () => {
    setModalView("none");
    navigate(-1);
  };

  // Event Info Card (shared between mobile/desktop)
  const EventInfoCard: React.FC<{ compact?: boolean }> = ({ compact }) => (
    <div
      className={`bg-white ${compact ? "rounded-[1.5rem] p-6" : "rounded-[2rem] p-8"} shadow-sm border border-gray-100 flex flex-col gap-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <h1
          className={`${compact ? "text-2xl" : "text-3xl"} font-extrabold tracking-tight`}
        >
          {event.name}
        </h1>
        <button
          onClick={handleShare}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-full transition-colors hover:bg-gray-50"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-500 font-medium">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#08351e] shrink-0" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#08351e] shrink-0" />
          {event.location}
        </span>
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#08351e] shrink-0" />
          {event.joinsCount} participant{event.joinsCount !== 1 ? "s" : ""}
        </span>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="font-extrabold text-gray-800 mb-2">About this Event</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {event.description}
        </p>
      </div>
      <div>
        <h3 className="font-extrabold text-gray-800 mb-2">Details</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{event.details}</p>
      </div>

      {/* Join button — only for upcoming (not joined) events */}
      {!isActiveEvent && (
        <button
          onClick={() => setModalView("confirm")}
          className="mt-2 self-start bg-[#08351e] hover:bg-[#0a4527] text-white font-extrabold px-10 py-3.5 rounded-full shadow-sm transition-colors active:scale-95"
        >
          Yes, Join Event
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white px-5 sm:px-8 lg:px-12 py-4 sticky top-0 z-40 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <img
          src={logo}
          alt="Public Hygiene Council"
          className="h-10 w-auto ml-auto"
        />
      </header>

      {/* Mobile & Tablet */}
      <div className="lg:hidden px-5 sm:px-8 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <div className="w-full h-52 sm:h-64 rounded-[1.5rem] overflow-hidden shadow-sm">
          <img
            src={getEventImageUrl(event.eventImage)}
            className="w-full h-full object-cover"
            alt={event.name}
          />
        </div>

        <EventInfoCard compact />

        {/* Active event extras — leaderboard + badges */}
        {isActiveEvent && (
          <>
            <LeaderboardCard
              leaderboard={leaderboardData?.leaderboard ?? []}
              currentUserId={currentUser?.id ?? null}
            />
            <RewardsBadgesCard
              rewards={event.rewards}
              earnedPoints={earnedPoints}
            />
          </>
        )}

        {/* Upcoming event — show rewards but no leaderboard */}
        {!isActiveEvent && (
          <RewardsBadgesCard rewards={event.rewards} earnedPoints={0} />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="max-w-full mx-auto px-8 xl:px-12 py-10">
          <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
            {/* LEFT */}
            <div className="col-span-7 flex flex-col gap-6">
              <div className="w-full h-64 xl:h-72 rounded-[2rem] overflow-hidden shadow-sm">
                <img
                  src={getEventImageUrl(event.eventImage)}
                  className="w-full h-full object-cover"
                  alt={event.name}
                />
              </div>
              <EventInfoCard />
            </div>

            {/* RIGHT */}
            <div className="col-span-5">
              <div className="sticky top-24 flex flex-col gap-6">
                {" "}
                {/* 👈 add flex flex-col gap-6 */}
                {/* Leaderboard — active events only, moved here from left column */}
                {isActiveEvent && (
                  <LeaderboardCard
                    leaderboard={leaderboardData?.leaderboard ?? []}
                    currentUserId={currentUser?.id ?? null}
                  />
                )}
                <RewardsBadgesCard
                  rewards={event.rewards}
                  earnedPoints={isActiveEvent ? earnedPoints : 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {modalView === "confirm" && (
        <ConfirmModal
          eventName={event.name}
          isJoining={isJoining}
          onCancel={() => setModalView("none")}
          onConfirm={handleConfirmJoin}
        />
      )}
      {modalView === "success" && (
        <SuccessModal eventName={event.name} onClose={handleSuccessClose} />
      )}
    </div>
  );
};
