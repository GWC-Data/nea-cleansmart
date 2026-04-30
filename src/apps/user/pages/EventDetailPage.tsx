import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Medal,
  Share2,
  Clock,
  Gift,
  StopCircle,
  Sparkles,
} from "lucide-react";
import { apiService } from "../../../services/apiService";
import { useAuth } from "../../../hooks/useAuth";
import type {
  EventData,
  EventLeaderboard,
  UserStats,
} from "../../../services/apiService";
import logo from "../../../assets/publicHygineCouncil.png";
import { toast } from "sonner";
import { getEventImageUrl } from "../../../utils/imageUtils";
import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
import { DurationSelectModal } from "../../../components/sections/user/modal/DurationSelectModal";
import { LogActivityForm } from "../../../components/sections/user/LogActivityForm";
import { EventGuidelines } from "../../../components/sections/user/EventGuidelines";

const MedalIcon: React.FC<{ label: string; className?: string }> = ({
  label,
  className,
}) => {
  const isDiamond = label === "Diamond";
  const isGold = label === "Gold";

  const place = isDiamond ? "1st" : isGold ? "2nd" : "3rd";
  const mainColor = isDiamond ? "#009cdc" : isGold ? "#e39c03" : "#94a1b2";
  const textColor = isDiamond ? "#2b3441" : isGold ? "#2b3441" : "#2b3441";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        {/* Scalloped edge */}
        <path
          d="M50 5 L58 10 L68 7 L73 16 L83 16 L83 27 L92 32 L89 42 L95 50 L89 58 L92 68 L83 73 L83 83 L73 84 L68 93 L58 90 L50 95 L42 90 L32 93 L27 84 L17 83 L17 73 L8 68 L11 58 L5 50 L11 42 L8 32 L17 27 L17 16 L27 16 L32 7 L42 10 Z"
          fill={mainColor}
        />
        {/* Inner circle line */}
        {/* <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={textColor}
          strokeWidth="0.5"
          strokeDasharray="1 1"
          opacity="0.5"
        /> */}

        {/* Text */}
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill={textColor}
          fontSize="26"
          fontWeight="900"
          fontFamily="serif"
        >
          {place.slice(0, -2)}
          <tspan fontSize="10" dy="-10">
            {place.slice(-2)}
          </tspan>
        </text>
      </svg>
    </div>
  );
};

const BADGES = [
  {
    label: "Silver",
    points: 50,
    hours: 5,
    color: "bg-[#eff1f2]",
    border: "border-slate-100",
    icon: "text-slate-400",
    ring: "ring-slate-200",
  },
  {
    label: "Gold",
    points: 100,
    hours: 10,
    color: "bg-[#f3e68a]",
    border: "border-yellow-100",
    icon: "text-yellow-400",
    ring: "ring-yellow-200",
  },
  {
    label: "Diamond",
    points: 150,
    hours: 15,
    color: "bg-[#caf4fb]",
    border: "border-blue-100",
    icon: "text-blue-400",
    ring: "ring-blue-200",
  },
];

// ── Rewards & Badges Card ────────────────────────────────────────────────────
const RewardsBadgesCard: React.FC<{
  rewards: string;
  userTotalHours: number;
  isActiveEvent?: boolean;
}> = ({ rewards, userTotalHours }) => {
  const highestEarned = [...BADGES]
    .reverse()
    .find((b) => userTotalHours >= b.hours);
  // const nextBadge = BADGES.find((b) => userTotalHours < b.hours);
  return (
    <div className="bg-[#ffffff] rounded-[2rem] p-6 shadow-sm border border-orange-50/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-[#08351e] p-2 rounded-xl shadow-lg shadow-green-900/10">
          <Medal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
            Badges
          </h3>
        </div>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-3 leading-relaxed">
        Complete clean-up hours to unlock badges and rewards.
      </p>
      {/* {isActiveEvent && nextBadge && (
        <div className="mb-5 bg-white rounded-2xl px-4 py-3 border border-gray-100">
          <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1.5">
            <span>Progress to {nextBadge.label}</span>
            <span className="text-[#08351e]">
              {(Math.floor(userTotalHours * 10) / 10).toFixed(1)}h /{" "}
              {nextBadge.hours}h
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[#08351e] transition-all duration-500"
              style={{
                width: `${Math.min((userTotalHours / nextBadge.hours) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )} */}
      {/* Badge */}
      <div className="flex flex-col lg:flex-row gap-3">
        {BADGES.map((badge) => {
          const isEarned = userTotalHours >= badge.hours;
          const isCurrent = highestEarned?.label === badge.label;
          return (
            <div
              key={badge.label}
              className={`flex items-center lg:flex-col lg:justify-center gap-4 lg:gap-3 rounded-2xl px-4 py-3 lg:py-5 lg:px-2 border shadow-sm transition-all lg:flex-1 ${isCurrent ? `${badge.color} border-transparent ring-2 ${badge.ring} scale-[1.02]` : isEarned ? `${badge.color} border-transparent opacity-70` : "bg-white border-gray-100"}`}
            >
              <div
                className={`p-1 rounded-full shrink-0 flex items-center justify-center`}
              >
                <MedalIcon label={badge.label} className="w-16 h-16" />
              </div>
              <div className="flex-1 lg:flex-none w-full flex flex-col items-start lg:items-center">
                <div className="flex items-center gap-2 lg:flex-col lg:gap-1.5">
                  <p className="font-extrabold text-gray-800 text-sm">
                    {badge.label}
                  </p>
                  {isCurrent && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.border} ${badge.icon} bg-white/70`}
                    >
                      ✓ Current
                    </span>
                  )}
                  {isEarned && !isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 bg-white/70">
                      ✓ Earned
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 font-medium lg:text-center mt-1 lg:mt-2 lg:leading-tight">
                  <span className="lg:block">{badge.points} pts</span>
                  <span className="lg:hidden"> · {badge.hours} hrs</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward */}
      <div className="mt-7 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-[#08351e] p-2 rounded-xl shadow-lg shadow-green-900/10">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
              Rewards
            </h3>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          {rewards}
        </p>
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
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { currentUser, isLoading, refreshUserProfile } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<EventLeaderboard | null>(null);
  const [eventsJoined, setEventsJoined] = useState<string[]>([]);
  const [modalView, setModalView] = useState<"none" | "confirm" | "success">(
    "none",
  );
  const [isJoining, setIsJoining] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dashboardLocation, setDashboardLocation] = useState("");

  const {
    state: sessionState,
    activeEventId,
    activeLogId,
    remainingSeconds,
    elapsedSeconds,
    restoredFromStorage,
    initializeTimer,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  } = useCleanUpSession();

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      if (!eventId) return;
      const [found, dashboard] = await Promise.all([
        apiService.getEventById(eventId),
        apiService.getDashboard(),
      ]);

      setEvent(found);
      setUserStats(dashboard?.stats ?? null);

      const joinedIds = (dashboard?.eventsJoined ?? []).map((e) => e.eventId);
      setEventsJoined(joinedIds);

      if (joinedIds.includes(eventId)) {
        const lb = await apiService.getEventLeaderboard(eventId);
        setLeaderboardData(lb);
      }
    } finally {
      setDataLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isLoading) return;
    loadData();
  }, [eventId, isLoading, loadData]);

  // Load active timer on mount
  useEffect(() => {
    async function loadActiveTimer() {
      const timerData = await apiService.getTimer();
      if (timerData && timerData.logId && timerData.checkInTime) {
        initializeTimer(timerData);
      }
    }
    loadActiveTimer();
  }, [initializeTimer]);

  // Geolocation for checkout
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
            const data = await res.json();
            if (data?.display_name) setDashboardLocation(data.display_name);
          } catch {}
        },
        () => {},
      );
    }
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const stopButtonDisabled = elapsedSeconds < 1800 && remainingSeconds > 0;

  const handleDurationSelected = async (durationSecs: number) => {
    if (!activeEventId) return;
    const result = await apiService.checkInEvent({
      eventId: activeEventId,
      checkInTime: new Date().toISOString(),
      hoursEnrolled: (durationSecs / 3600).toString(),
    });

    // Structured error returned from backend
    if (result !== null && typeof result === "object" && "error" in result) {
      cancelDurationPicker();
      toast.error(result.error);
      return;
    }

    // Null means something unexpected happened
    if (result === null) {
      cancelDurationPicker();
      toast.error("Check-in failed. Please try again.");
      return;
    }

    // Success: result is the log ID (number)
    handleCheckIn(result, durationSecs);
    toast.success("Checked in! Your session has started.");
  };

  const handleSubmitReport = async (
    weight: number,
    type: string,
    finalLocation: string,
    photo?: File,
  ) => {
    if (!activeLogId) return;
    const now = new Date();
    const timerData = await apiService.getTimer();
    let checkOutDate = now;
    let checkOutTime = now.toISOString();
    if (timerData?.checkInTime && timerData?.hoursEnrolled) {
      const checkInDate = new Date(timerData.checkInTime);
      const hoursStr = timerData.hoursEnrolled.toLowerCase();
      const durationMs = hoursStr.endsWith("min")
        ? parseFloat(hoursStr) * 60 * 1000
        : parseFloat(hoursStr) * 3600 * 1000;
      const maxCheckOut = new Date(checkInDate.getTime() + durationMs);

      // Prevent clock skew issues: checkOutDate cannot be before checkInDate
      if (checkOutDate < checkInDate) {
        checkOutDate = checkInDate;
      }

      checkOutTime =
        checkOutDate < maxCheckOut
          ? checkOutDate.toISOString()
          : maxCheckOut.toISOString();
    }
    const checkoutResult = await apiService.checkOutEvent(activeLogId, {
      checkOutTime,
      garbageWeight: weight,
      garbageType: type,
      eventLocation: finalLocation,
      wasteImage: photo,
    });

    if (checkoutResult === true) {
      completeSession();
      toast.success("Report submitted! Great job 🌿");
      await loadData();
    } else {
      // checkoutResult is { error: string }
      toast.error(
        checkoutResult.error || "Failed to submit report. Please try again.",
      );
    }
  };

  //  Loading guard — BEFORE any derivations
  if (dataLoading || isLoading || !event)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium">
        Loading event...
      </div>
    );

  // Derived from dashboard eventsJoined — true when this event is in the joined list
  const isActiveEvent = eventsJoined.includes(eventId);

  // Total hours for the current user from the leaderboard entry
  const userTotalHours = currentUser
    ? (leaderboardData?.leaderboard.find((e) => e.userId === currentUser.id)
        ?.totalHours ?? 0)
    : 0;

  const formattedDate = new Date(event.startDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, url });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    } else {
      // Old-school fallback for insecure contexts (HTTP)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (success) {
          toast.success("Link copied to clipboard!");
        } else {
          toast.error("Cannot copy link in this environment.");
        }
      } catch (err) {
        toast.error("Cannot copy link in this environment.");
      }
    }
  };

  const handleConfirmJoin = async () => {
    setIsJoining(true);
    try {
      // Leave any currently active event first
      const currentActiveEvent = currentUser?.joinedEvents?.[0];
      if (currentActiveEvent) {
        const activeEventId =
          typeof currentActiveEvent === "number"
            ? currentActiveEvent
            : (currentActiveEvent as any).eventId;
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
          className="cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-full transition-colors hover:bg-gray-50"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      <div
        className={`flex ${compact ? "flex-row items-center justify-between" : "flex-col gap-2"} text-sm text-gray-500 font-medium`}
      >
        <div className="flex flex-col gap-2">
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

        {compact && (
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#f3f4f6"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="#08351e"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={
                  213.6 -
                  Math.min((userStats?.totalPoints ?? 0) / 150, 1) * 213.6
                }
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-[#08351e] leading-none">
                {userStats?.totalPoints ?? 0}
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                points
              </span>
            </div>
          </div>
        )}
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
          className="cursor-pointer mt-2 self-start bg-[#08351e] hover:bg-[#0a4527] text-white font-extrabold px-10 py-3.5 rounded-full shadow-sm transition-colors active:scale-95"
        >
          Yes, Join Event
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white px-5 sm:px-8 lg:px-12 py-4 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="hidden lg:flex flex-1">
            {/* Start Clean-up — only for active (joined) events */}
            {isActiveEvent && sessionState === "idle" && (
              <button
                onClick={() => {
                  if (userStats && (userStats.todayHours || 0) >= 2) {
                    toast.error(
                      "Daily limit of 2 hours reached! See you tomorrow",
                    );
                    return;
                  }
                  openDurationPicker(eventId);
                }}
                className={`cursor-pointer font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-white text-sm ${
                  userStats && (userStats.todayHours || 0) >= 2
                    ? "bg-gray-400 grayscale cursor-not-allowed"
                    : "bg-[#96c93d] hover:bg-[#86b537]"
                }`}
              >
                {userStats && (userStats.todayHours || 0) >= 2
                  ? "Daily Limit Reached"
                  : "Start Clean-up"}
              </button>
            )}

            {/* Active session countdown + Stop */}
            {isActiveEvent && sessionState === "checked_in" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold tabular-nums text-sm">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
                <button
                  onClick={stopButtonDisabled ? undefined : initiateCheckout}
                  disabled={stopButtonDisabled}
                  className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all ${
                    stopButtonDisabled
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      : "cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
                  }`}
                  title={
                    stopButtonDisabled
                      ? "Must complete at least 30 minutes before stopping"
                      : undefined
                  }
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Clean-up</span>
                </button>
              </div>
            )}
          </div>
          <div>
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Mobile & Tablet */}
      <div className="lg:hidden px-5 sm:px-8 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Mobile Action Area */}
        <div className="flex justify-end items-center -mb-2">
          {isActiveEvent && sessionState === "idle" && (
            <button
              onClick={() => {
                if (userStats && (userStats.todayHours || 0) >= 2) {
                  toast.error(
                    "Daily limit of 2 hours reached! See you tomorrow",
                  );
                  return;
                }
                openDurationPicker(eventId);
              }}
              className={`cursor-pointer font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-white text-sm ${
                userStats && (userStats.todayHours || 0) >= 2
                  ? "bg-gray-400 grayscale cursor-not-allowed"
                  : "bg-[#96c93d] hover:bg-[#86b537]"
              }`}
            >
              {userStats && (userStats.todayHours || 0) >= 2
                ? "Daily Limit Reached"
                : "Start Clean-up"}
            </button>
          )}

          {isActiveEvent && sessionState === "checked_in" && (
            <div className="flex justify-evenly w-full gap-3">
              <div className="flex items-center gap-1.5">
                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-[#96c93d]/70 rounded-lg w-12 h-10 flex items-center justify-center">
                    <span className="text-xl font-black text-[#0083cf] tabular-nums">
                      {Math.floor(remainingSeconds / 3600)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Hrs
                  </span>
                </div>
                {/* Minutes */}
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-[#96c93d]/70 rounded-lg w-12 h-10 flex items-center justify-center">
                    <span className="text-xl font-black text-[#0083cf] tabular-nums">
                      {Math.floor((remainingSeconds % 3600) / 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Min
                  </span>
                </div>
                {/* Seconds */}
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-[#96c93d]/70 rounded-lg w-12 h-10 flex items-center justify-center">
                    <span className="text-xl font-black text-[#0083cf] tabular-nums">
                      {Math.floor(remainingSeconds % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    Sec
                  </span>
                </div>
              </div>

              <button
                onClick={stopButtonDisabled ? undefined : initiateCheckout}
                disabled={stopButtonDisabled}
                className={`w-44 h-10 cursor-pointer font-extrabold rounded-full text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                  stopButtonDisabled
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
                }`}
                title={
                  stopButtonDisabled
                    ? "Must complete at least 30 minutes before stopping"
                    : undefined
                }
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop Clean-up</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-full h-52 sm:h-64 rounded-[1.5rem] overflow-hidden shadow-sm">
          <img
            src={getEventImageUrl(event.eventImage)}
            className="w-full h-full object-cover"
            alt={event.name}
          />
        </div>

        <EventInfoCard compact />

        {/* Rewards & Badges section */}
        <RewardsBadgesCard
          rewards={event.rewards}
          userTotalHours={isActiveEvent ? userTotalHours : 0}
          isActiveEvent={isActiveEvent}
        />

        <EventGuidelines />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="max-w-full mx-auto px-8 xl:px-12 py-10">
          <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
            {/* LEFT */}
            <div className="col-span-7 flex flex-col gap-6">
              <div className="w-full h-64 xl:h-[320px] rounded-[2rem] overflow-hidden shadow-sm">
                <img
                  src={getEventImageUrl(event.eventImage)}
                  className="w-full h-full object-cover"
                  alt={event.name}
                />
              </div>
              <div className="lg:pr-4">
                <EventInfoCard />
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-span-5">
              <div className="sticky top-24 flex flex-col gap-6">
                {/* XP Ring */}
                {(() => {
                  const totalPoints = userStats?.totalPoints ?? 0;
                  const getNextBadge = (pts: number) =>
                    pts < 50
                      ? { label: "Silver", pointsNeeded: 50 - pts }
                      : pts < 100
                        ? { label: "Gold", pointsNeeded: 100 - pts }
                        : pts < 150
                          ? { label: "Diamond", pointsNeeded: 150 - pts }
                          : null;
                  const nextBadge = getNextBadge(totalPoints);
                  // const hasBadge = totalPoints >= 50;
                  // const badgeName = !hasBadge
                  //   ? null
                  //   : totalPoints < 100
                  //     ? "Silver"
                  //     : totalPoints < 150
                  //       ? "Gold"
                  //       : "Diamond";
                  const start =
                    totalPoints < 50
                      ? 0
                      : totalPoints < 100
                        ? 50
                        : totalPoints < 150
                          ? 100
                          : 150;
                  const end =
                    totalPoints < 50 ? 50 : totalPoints < 100 ? 100 : 150;
                  const progress = Math.min(
                    (totalPoints - start) / (end - start),
                    1,
                  );
                  const circumference = 264;
                  const offset = circumference - progress * circumference;
                  return (
                    <div className="w-full h-64 xl:h-[320px] bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
                      <div className="relative w-40 h-40 xl:w-48 xl:h-48">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            strokeWidth="8"
                            stroke="#f3f7f5"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="#96c93d"
                            fill="transparent"
                            r="42"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl xl:text-5xl font-black text-gray-900 leading-none">
                            {totalPoints}
                          </span>
                          <span className="text-[10px] xl:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                            Points
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <p className="text-sm font-extrabold text-gray-800 text-center">
                          Contribution Level
                        </p>
                        <p className="text-xs text-gray-500 font-medium text-center">
                          {nextBadge ? (
                            <>
                              <span className="font-black text-gray-800">
                                {nextBadge.pointsNeeded} pts{" "}
                              </span>
                              until your{" "}
                              <span className="font-black text-[#08351e]">
                                {nextBadge.label}
                              </span>{" "}
                              badge!
                            </>
                          ) : (
                            <span className="font-black text-[#08351e] flex items-center gap-1 justify-center">
                              <Sparkles className="w-4 h-4" /> All badges
                              earned!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <RewardsBadgesCard
                  rewards={event.rewards}
                  userTotalHours={isActiveEvent ? userTotalHours : 0}
                  isActiveEvent={isActiveEvent}
                />

                {/* Event Guidelines */}
                <EventGuidelines />
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

      {/* Duration Picker Modal */}
      {sessionState === "selecting_duration" && (
        <DurationSelectModal
          onSelect={handleDurationSelected}
          onCancel={cancelDurationPicker}
          todayHours={userStats?.todayHours || 0}
        />
      )}

      {/* Log Activity Form */}
      {sessionState === "logging_activity" && (
        <LogActivityForm
          elapsedSeconds={elapsedSeconds}
          location={dashboardLocation}
          onCancel={restoredFromStorage ? undefined : cancelCheckout}
          onSubmit={handleSubmitReport}
          isMandatory={restoredFromStorage}
        />
      )}
    </div>
  );
};
