import React, { useEffect, useState, useCallback, useRef } from "react";
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
  QrCode,
  CircleX,
  Clock3,
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
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { orgApiService } from "../../../services/orgApiService";

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
      <p className="text-xs font-medium mb-3 leading-relaxed">
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
      {rewards && (
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
          <p className="text-xs font-medium leading-relaxed">{rewards}</p>
        </div>
      )}
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

  const [isEventStarted, setIsEventStarted] = useState(false);
  const [eventCheckInTime, setEventCheckInTime] = useState<string | null>(null);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  // const [totalWeightCollected, setTotalWeightCollected] = useState("");
  const [elapsedOrgSeconds, setElapsedOrgSeconds] = useState(0);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const lastScannedRef = useRef<{ id: string; time: number } | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerControlsRef = React.useRef<IScannerControls | null>(null);

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

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setDataLoading(true);
      try {
        if (!eventId) return;

        // Determine if the current user is an organization and call the correct dashboard endpoint
        const isOrgUser = currentUser?.role === "organization";

        const [found, statusData] = await Promise.all([
          apiService.getEventById(eventId),
          apiService.getEventStatus(eventId),
        ]);

        setEvent(found);
        setIsEventStarted(statusData?.isStarted ?? false);
        setEventCheckInTime(statusData?.checkInTime ?? null);

        // Always fetch the regular dashboard to get joined events and personal stats
        const dashboard = await apiService.getDashboard();
        setUserStats(dashboard?.stats ?? null);
        const joinedIds = (dashboard?.eventsJoined ?? []).map((e) => e.eventId);

        if (isOrgUser) {
          // Also fetch organization specific dashboard data
          await orgApiService.getDashboard();
          // For organizations, we also consider them "joined" if they created the event
          const createdBy = found?.createdBy;
          const orgId = currentUser?.id;
          const isCreator = createdBy && orgId && createdBy === orgId;
          if (isCreator && !joinedIds.includes(eventId)) {
            joinedIds.push(eventId);
          }
        }

        setEventsJoined(joinedIds);

        if (joinedIds.includes(eventId)) {
          const lb = await apiService.getEventLeaderboard(eventId);
          setLeaderboardData(lb);
        }
      } finally {
        if (!silent) setDataLoading(false);
      }
    },
    [eventId, currentUser?.role, currentUser?.id],
  );

  useEffect(() => {
    if (isLoading) return;
    loadData();
  }, [eventId, isLoading, loadData]);

  // Load active cleanup timer on mount
  useEffect(() => {
    async function loadActiveTimer() {
      const timerData = await apiService.getTimer();
      if (timerData && timerData.logId && timerData.checkInTime) {
        initializeTimer(timerData);
      }
    }
    loadActiveTimer();
  }, [initializeTimer]);

  // Running timer for organization private events
  useEffect(() => {
    if (!isEventStarted || !eventCheckInTime) {
      setElapsedOrgSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const diffMs = Date.now() - new Date(eventCheckInTime).getTime();
      setElapsedOrgSeconds(Math.max(0, Math.floor(diffMs / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isEventStarted, eventCheckInTime]);

  // QR Scanner Lifecycle
  useEffect(() => {
    if (!isScanningQR) {
      if (scannerControlsRef.current) {
        scannerControlsRef.current.stop();
        scannerControlsRef.current = null;
      }
      return;
    }

    const codeReader = new BrowserQRCodeReader();
    let isMounted = true;

    async function startScanner() {
      if (!videoRef.current) return;
      try {
        const controls = await codeReader.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result && isMounted) {
              const scannedUserId = result.getText();

              // Cooldown to prevent duplicate scans (3 seconds)
              const now = Date.now();
              if (
                lastScannedRef.current &&
                lastScannedRef.current.id === scannedUserId &&
                now - lastScannedRef.current.time < 3000
              ) {
                return;
              }

              lastScannedRef.current = { id: scannedUserId, time: now };
              handleScanAttendance(scannedUserId);
              // We no longer call setIsScanningQR(false) here for continuous scanning
            }
            if (error && !(error.name === "NotFoundException")) {
              // Ignore NotFoundException as it's common during scanning
              console.debug("QR Scan Error:", error);
            }
          },
        );
        if (isMounted) {
          scannerControlsRef.current = controls;
        } else {
          controls.stop();
        }
      } catch (err) {
        console.error("Failed to start QR scanner:", err);
        toast.error("Could not access camera for QR scanning.");
        setIsScanningQR(false);
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (scannerControlsRef.current) {
        scannerControlsRef.current.stop();
        scannerControlsRef.current = null;
      }
    };
  }, [isScanningQR]);

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

  // Check if the current user is an organization
  const isOrganization = currentUser?.role === "organization";
  // Check if the current user is the creator of this event
  const isCreator = event && currentUser && event.createdBy === currentUser.id;

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
    const shareText = `Join me at "${event.name}" and let's keep Singapore clean together!`;

    // 1. Try Native Web Share API (Supported on Mobile & Modern Desktop HTTPS/Localhost)
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: event.name, 
          text: shareText,
          url 
        });
        return; // Successfully opened native share sheet
      } catch (err) {
        // If user simply closed the share sheet, stop here
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error("Native share failed, falling back", err);
      }
    }

    // 2. Fallback: Directly open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + url)}`;
    const fullTextToCopy = `${shareText}\n\n${url}`;
    
    // Copy to clipboard as a backup
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(fullTextToCopy);
        toast.success("Message copied! Opening WhatsApp...");
      } catch (err) {
        toast.success("Opening WhatsApp...");
      }
    } else {
      // Legacy fallback for insecure contexts (HTTP) where navigator.clipboard is disabled
      try {
        const textArea = document.createElement("textarea");
        textArea.value = fullTextToCopy;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (success) {
          toast.success("Message copied! Opening WhatsApp...");
        } else {
          toast.success("Opening WhatsApp...");
        }
      } catch (err) {
        toast.success("Opening WhatsApp...");
      }
    }

    // Open WhatsApp in a new tab
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 600);
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
    // navigate to the dashboard after a successful event join
    navigate("/dashboard");
  };

  const handleStartEvent = async () => {
    try {
      const response = await apiService.startEvent(eventId);
      if (response && response.success) {
        setIsEventStarted(true);
        setEventCheckInTime(response.checkInTime);
        toast.success(
          "Cleanup event started successfully! Let's clean up Singapore! 🌿",
        );
        await loadData();
      } else {
        toast.error(response?.message || "Failed to start cleanup event.");
      }
    } catch (err) {
      toast.error("An error occurred while starting the event.");
    }
  };

  const handleStopEventSubmit = async (
    weight: number,
    type: string,
    finalLocation: string,
    // photo?: File, // Organizations don't currently upload photos for bulk stop
  ) => {
    try {
      const response = await apiService.stopEvent(eventId, {
        totalWeight: weight,
        location: finalLocation,
        garbageType: type,
      });

      if (response && response.success) {
        setIsEventStarted(false);
        setEventCheckInTime(null);
        setStopModalOpen(false);
        toast.success(
          `Event stopped successfully! Distributed rewards among ${response.attendeesCount} participants! 🏆`,
        );
        await loadData();
      } else {
        toast.error(response?.message || "Failed to stop cleanup event.");
      }
    } catch (err) {
      toast.error("An error occurred while stopping the event.");
    }
  };

  const handleScanAttendance = async (userId: string) => {
    setIsProcessingScan(true);
    try {
      const success = await apiService.recordAttendance(eventId, userId);
      if (success) {
        toast.success("Attendance scanned and registered successfully! 🌿");
        // Silent update to refresh stats without closing camera
        await loadData(true);
      } else {
        toast.error(
          "Failed to scan attendance. Please ensure the user is registered for this event.",
        );
      }
    } catch (err) {
      toast.error("An error occurred while scanning attendance.");
    } finally {
      setIsProcessingScan(false);
    }
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
              <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">
                points
              </span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {event.description && (
        <div>
          <h3 className="font-extrabold text-gray-800 mb-2">About this Event</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {event.description}
          </p>
        </div>
      )}
      {event.details && (
        <div>
          <h3 className="font-extrabold text-gray-800 mb-2">Details</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {event.details}
          </p>
        </div>
      )}

      {/* Join button — only for upcoming (not joined) events and if approved */}
      {!isActiveEvent &&
        !isOrganization &&
        event.status === "approved" && (
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
            onClick={() => navigate(-1)}
            className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="hidden lg:flex flex-1">
            {/* Management UI for the event creator */}
            {isCreator ? (
              event.status === "approved" ? (
                <div className="flex items-center gap-4">
                  {!isEventStarted ? (
                    <>
                      <button
                        onClick={() => setIsScanningQR(true)}
                        className="cursor-pointer flex items-center justify-center bg-[#E8F2FA] text-[#0083cf] p-2.5 rounded-full hover:bg-blue-100 transition-all border border-[#0083cf]/20"
                        title="Scan Attendance QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleStartEvent}
                        className="cursor-pointer bg-[#96c93d] hover:bg-[#86b537] text-white font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-sm"
                      >
                        Start Cleanup Event
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-bold tabular-nums text-sm">
                          {formatTime(elapsedOrgSeconds)}
                        </span>
                      </div>
                      <button
                        onClick={() => setStopModalOpen(true)}
                        className="cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Stop Cleanup</span>
                      </button>
                    </>
                  )}
                </div>
              ) : null
            ) : (
              <>
                {/* Start Clean-up — only for active (joined) events, restrict private events if not approved */}
                {isActiveEvent &&
                  sessionState === "idle" &&
                  event.eventType !== "private" &&
                  event.status === "approved" && (
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

                {/* Always show active participant session if exists, regardless of role, restrict if not approved for private events */}
                {sessionState === "checked_in" &&
                  activeEventId === eventId &&
                  (event.eventType !== "private" &&
                    event.status === "approved") && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-bold tabular-nums text-sm">
                          {formatTime(remainingSeconds)}
                        </span>
                      </div>
                      <button
                        onClick={
                          stopButtonDisabled ? undefined : initiateCheckout
                        }
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
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {event.status === "pending" && (
              <div className="flex justify-center items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <Clock3 className="w-4 h-4" />
                <span>Pending</span>
              </div>
            )}
            {event.status === "rejected" && (
              <div className="flex justify-center items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <CircleX className="w-4 h-4" />
                <span>Rejected</span>
              </div>
            )}
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
        <div className="flex justify-end items-center -mb-2 w-full">
          {isCreator ? (
            event.status === "approved" ? (
              <div className="flex items-center gap-4 w-full justify-between">
                {!isEventStarted ? (
                  <>
                    <button
                      onClick={() => setIsScanningQR(true)}
                      className="cursor-pointer flex items-center justify-center bg-[#E8F2FA] text-[#0083cf] p-2.5 rounded-full hover:bg-blue-100 transition-all border border-[#0083cf]/20"
                      title="Scan Attendance QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleStartEvent}
                      className="cursor-pointer bg-[#96c93d] hover:bg-[#86b537] text-white font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-sm"
                    >
                      Start Cleanup Event
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold tabular-nums text-sm">
                        {formatTime(elapsedOrgSeconds)}
                      </span>
                    </div>
                    <button
                      onClick={() => setStopModalOpen(true)}
                      className="cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop Cleanup</span>
                    </button>
                  </>
                )}
              </div>
            ) : null
          ) : (
            <>
              {isActiveEvent &&
                sessionState === "idle" &&
                (event.eventType !== "private" &&
                  event.status === "approved") && (
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

              {sessionState === "checked_in" &&
                activeEventId === eventId &&
                (event.eventType !== "private" &&
                  event.status === "approved") && (
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
                      onClick={
                        stopButtonDisabled ? undefined : initiateCheckout
                      }
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
            </>
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
                          <span className="text-[10px] xl:text-xs font-black uppercase tracking-widest mt-1">
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

      {/* ── Global Footer ───────────────────────────────────────────────────── */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-5 border-t border-gray-100 animate-slide-up bg-white lg:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-8 lg:h-10 w-auto object-contain"
            />
          </div>
          <p className="text-xs font-semibold text-gray-400 text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>

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

      {/* Log Activity Form — only shown for the event the session belongs to */}
      {sessionState === "logging_activity" && activeEventId === eventId && (
        <LogActivityForm
          eventName={event?.name}
          elapsedSeconds={elapsedSeconds}
          location={dashboardLocation}
          onCancel={restoredFromStorage ? undefined : cancelCheckout}
          onSubmit={handleSubmitReport}
          isMandatory={restoredFromStorage}
        />
      )}

      {/* Organization Stop Event Form */}
      {stopModalOpen && isCreator && (
        <LogActivityForm
          eventName={event?.name}
          elapsedSeconds={elapsedOrgSeconds}
          location={event?.location || ""}
          onCancel={() => setStopModalOpen(false)}
          onSubmit={handleStopEventSubmit}
        />
      )}
      {/* QR Code Scanner Simulation Modal */}
      {isScanningQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#1e1e1e] text-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-800 relative overflow-hidden animate-in zoom-in-95">
            {/* Holographic Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-[#E8F2FA]/10 text-[#0083cf] rounded-full flex items-center justify-center mb-3 animate-pulse border border-[#0083cf]/30">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                QR Code Attendance Scanner
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Live camera scanner for Singapore PHC cleanup
              </p>
            </div>

            {/* Real Live Camera Box */}
            <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-2xl bg-black border border-gray-800 flex flex-col items-center justify-center overflow-hidden mb-6 group">
              <video ref={videoRef} className="w-full h-full object-cover" />
              {/* Camera Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-[#0083cf] rounded-xl relative">
                  {/* Pulsing Target corners */}
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>

                  {/* Laser scan line */}
                  <div className="w-full h-[2px] bg-green-400/80 shadow-[0_0_8px_rgba(74,222,128,0.8)] absolute top-0 animate-bounce"></div>
                </div>
              </div>

              <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-green-400 font-mono tracking-widest uppercase animate-pulse">
                [ CAMERA LIVE - SCANNING... ]
              </p>

              {/* Processing Overlay */}
              {isProcessingScan && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white text-xs font-bold tracking-widest uppercase">
                    Processing Scan...
                  </p>
                </div>
              )}
            </div>

            {/* Registered Participants to Scan - Commented out as requested */}
            {/* <div className="mb-6 text-left">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Registered Attendee to Scan
              </label>
              {(() => {
                let registered: string[] = event?.registeredParticipant || [];
                if (typeof registered === 'string') {
                  try { registered = JSON.parse(registered); } catch { registered = []; }
                }

                if (registered.length === 0) {
                  return (
                    <p className="text-sm text-yellow-500 font-semibold bg-yellow-500/10 px-4 py-3 rounded-xl border border-yellow-500/20 text-center">
                      No registered participants left to scan!
                    </p>
                  );
                }

                return (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {registered.map((userId, idx) => (
                      <div
                        key={userId}
                        onClick={() => {
                          handleScanAttendance(userId);
                          setIsScanningQR(false);
                        }}
                        className="cursor-pointer bg-[#2a2a2a] hover:bg-[#333] border border-gray-800 hover:border-[#0083cf]/50 p-3 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-gray-200">Registered Participant</p>
                            <p className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">{userId}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md shrink-0">
                          SCAN QR
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div> */}

            <button
              onClick={() => setIsScanningQR(false)}
              className="cursor-pointer w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
