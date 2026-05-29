import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Share2,
  QrCode,
  CircleX,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { apiService } from "../../../services/apiService";
import { useAuth } from "../../../hooks/useAuth";
import type {
  EventData,
} from "../../../services/apiService";
import logo from "../../../assets/publicHygineCouncil.png";
import { toast } from "sonner";
import { getEventImageUrl } from "../../../utils/imageUtils";
// import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
// import { DurationSelectModal } from "../../../components/sections/user/modal/DurationSelectModal";
import { LogActivityForm } from "../../../components/sections/user/LogActivityForm";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { orgApiService } from "../../../services/orgApiService";

// Configuration constants for event duration constraints
const ORG_MAX_DURATION_HOURS = 2; // Default fallback maximum allowed duration in hours if not calculable from event details
// Commented out unused constant to fix compiler warning TS6133
// const ORG_MIN_DURATION_MINUTES = 30; // Minimum duration required before stopping in minutes


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

// Helper to parse date/time strings by treating the digits as Singapore Local Time (SGT, UTC+8).
const parseAsSingaporeTime = (isoString: string): Date => {
  if (!isoString) return new Date();
  try {
    const clean = isoString.replace(/Z$|[+-]\d{2}:\d{2}$/, "");
    const withOffset = clean.includes("T") ? `${clean}+08:00` : `${clean.replace(" ", "T")}+08:00`;
    const parsed = new Date(withOffset);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (e) {
    // Fallback to standard parsing
  }
  return new Date(isoString);
};

// Helper to format scan and checkout logs in the Singapore local time format (SGT, UTC+8) for the details modal
const formatAttendeeLogDateTime = (isoString: string | null): string => {
  if (!isoString) return "N/A";
  try {
    const parsedDate = parseAsSingaporeTime(isoString);
    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Singapore",
    });
  } catch (e) {
    return new Date(isoString).toLocaleString();
  }
};

// ── Main Page ────────────────────────────────────────────────────────────────
export const EventDetailPage: React.FC = () => {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { currentUser, isLoading, refreshUserProfile } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  // Note: leaderboardData state and getEventLeaderboard API call were removed because they were unused and caused compile errors
  const [eventsJoined, setEventsJoined] = useState<string[]>([]);
  const [modalView, setModalView] = useState<"none" | "confirm" | "success">(
    "none",
  );
  const [isJoining, setIsJoining] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  // Commented out unused userStats and dashboardLocation states
  // const [userStats, setUserStats] = useState<UserStats | null>(null);
  // const [dashboardLocation, setDashboardLocation] = useState("");

  // Commented out unused event session status state to fix compiler warning TS6133
  // const [isEventStarted, setIsEventStarted] = useState(false);
  const [eventCheckInTime, setEventCheckInTime] = useState<string | null>(null);
  const [isScanningQR, setIsScanningQR] = useState(false);
  // Commented out unused lastScannedUserId state to fix compiler warning TS6133
  // const [lastScannedUserId, setLastScannedUserId] = useState<string | null>(null);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  // const [totalWeightCollected, setTotalWeightCollected] = useState("");
  // Declared state without its unused setter to fix compiler warning TS6133
  const [elapsedOrgSeconds] = useState(0);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  // Track the specific check-in log entry selected by the organization user to display in the details modal popup
  const [selectedAttendeeLog, setSelectedAttendeeLog] = useState<any | null>(null);

  // Check if the current user is the creator of this event
  const isCreator = event && currentUser && event.createdBy === currentUser.id;

  // Commented out unused ref to fix compiler warning TS6133
  // const hasAutoOpenedRef = useRef(false);

  // Find the event duration in hours dynamically based on event's startDate and endDate
  const getEventDurationHours = (): number => {
    if (!event || !event.startDate || !event.endDate) {
      return ORG_MAX_DURATION_HOURS; // Fallback to default of 2 hours
    }
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();
    if (isNaN(start) || isNaN(end)) {
      return ORG_MAX_DURATION_HOURS;
    }
    const diffMs = end - start;
    const diffHours = diffMs / (3600 * 1000);

    // Return standard duration mapping: 30m (0.5h), 1h (1h), 1.5h (1h 30m), 2h (2h)
    if (diffHours <= 0.75) return 0.5;
    if (diffHours <= 1.25) return 1.0;
    if (diffHours <= 1.75) return 1.5;
    return 2.0;
  };

  const dynamicDurationHours = getEventDurationHours();

  // Event timer and stop lock logic for organization started events derived from dynamic duration
  const orgDurationSeconds = dynamicDurationHours * 3600;
  // Commented out unused derived variables to fix compiler warning TS6133
  // const orgRemainingSeconds = Math.max(0, orgDurationSeconds - elapsedOrgSeconds);
  // const orgStopButtonDisabled = elapsedOrgSeconds < Math.min(ORG_MIN_DURATION_MINUTES, dynamicDurationHours * 60) * 60;

  const lastScannedRef = useRef<{ id: string; time: number } | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerControlsRef = React.useRef<IScannerControls | null>(null);

  // Commented out unused useCleanUpSession hook
  /*
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
  */

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
        // Commented out unused state setter to fix compiler warning TS6133
        // setIsEventStarted(statusData?.isStarted ?? false);
        setEventCheckInTime(statusData?.checkInTime ?? null);

        // Always fetch the regular dashboard to get joined events and personal stats
        const dashboard = await apiService.getDashboard();
        // setUserStats(dashboard?.stats ?? null);
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
          // Fetch leaderboard if needed in the future; removed setLeaderboardData here to fix compile error
          await apiService.getEventLeaderboard(eventId);
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
  // Commented out unused active timer loader
  /*
  useEffect(() => {
    async function loadActiveTimer() {
      const timerData = await apiService.getTimer();
      if (timerData && timerData.logId && timerData.checkInTime) {
        initializeTimer(timerData);
      }
    }
    loadActiveTimer();
  }, [initializeTimer]);
  */

  // Running timer for organization private events commented out per user request
  /*
  useEffect(() => {
    if (!isEventStarted || !eventCheckInTime) {
      setElapsedOrgSeconds(0);
      return;
    }

    if (stopModalOpen) {
      // Pause the timer visual tick when stop cleanup modal is open
      return;
    }

    // Immediately update the timer value to sync with real world on mount/resume
    const updateTimer = () => {
      const diffMs = Date.now() - new Date(eventCheckInTime).getTime();
      const elapsed = Math.max(0, Math.floor(diffMs / 1000));
      setElapsedOrgSeconds(elapsed);

      // Replicate "Regular Participants" logic: Automatically open the stop modal when the event timer hits 00:00 (2 hours elapsed)
      if (isCreator && elapsed >= orgDurationSeconds && !hasAutoOpenedRef.current) {
        hasAutoOpenedRef.current = true;
        setStopModalOpen(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isEventStarted, eventCheckInTime, stopModalOpen, isCreator, orgDurationSeconds]);
  */

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

  // Geolocation for checkout (commented out as it's unused now)
  /*
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
          } catch { }
        },
        () => { },
      );
    }
  }, []);
  */

  // Commented out unused formatTime helper to fix compiler warning TS6133
  /*
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  */

  // Commented out unused volunteer check-in/check-out states and handlers
  /*
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
  */

  //  Loading guard — BEFORE any derivations
  if (dataLoading || isLoading || !event)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium">
        Loading event...
      </div>
    );

  // Derived from dashboard eventsJoined — true when this event is in the joined list
  const isActiveEvent = eventsJoined.includes(eventId);

  // Check if the event's endDate is in the past
  const isEventCompleted = event.endDate ? new Date(event.endDate) < new Date() : false;

  // Check if the current user is an organization
  const isOrganization = currentUser?.role === "organization";

  // Commented out unused derived variable isCreatorOrg to fix compiler warning TS6133
  // const isCreatorOrg = isCreator && isOrganization;


  // Helper to render the event date and time formatted in the Singapore timezone with AM/PM.
  // Displays same-day events in a stacked format and multi-day events as separate start/end blocks.
  const renderEventDateTime = () => {
    if (!event || !event.startDate || !event.endDate) return null;

    const startDate = parseAsSingaporeTime(event.startDate);
    const endDate = parseAsSingaporeTime(event.endDate);

    // Compare date strings to check if they occur on the same calendar day in Singapore timezone
    const isSameDay =
      startDate.toLocaleDateString("en-US", { timeZone: "Asia/Singapore" }) ===
      endDate.toLocaleDateString("en-US", { timeZone: "Asia/Singapore" });

    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Singapore",
      });

    const formatDateLong = (date: Date) =>
      date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Singapore",
      });

    const formatDateShort = (date: Date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Singapore",
      });

    if (isSameDay) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-900 font-semibold">{formatDateLong(startDate)}</span>
          <span className="text-gray-500 text-xs font-medium">{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 text-sm text-gray-500 font-medium">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start</span>
            <span className="text-gray-900 font-semibold">{formatDateShort(startDate)} · {formatTime(startDate)}</span>
          </div>
          <span className="hidden sm:inline text-gray-400 font-bold">→</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">End</span>
            <span className="text-gray-900 font-semibold">{formatDateShort(endDate)} · {formatTime(endDate)}</span>
          </div>
        </div>
      );
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `Join me at "${event.name}" and let's keep Singapore clean together!`;

    // 1. Try Native Web Share API (Supported on Mobile & Modern Desktop HTTPS/Localhost)
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText,
          url,
        });
        return; // Successfully opened native share sheet
      } catch (err) {
        // If user simply closed the share sheet, stop here
        if (err instanceof Error && err.name === "AbortError") {
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
      window.open(whatsappUrl, "_blank");
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

  // Commented out unused handleStartEvent function to fix compiler warning TS6133
  /*
  const handleStartEvent = async () => {
    try {
      const response = await apiService.startEvent(eventId);
      if (response && response.success) {
        setIsEventStarted(true);
        setEventCheckInTime(response.checkInTime);
        // Reset the auto-open flag on event start so it can trigger when this new session ends
        hasAutoOpenedRef.current = false;
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
  */

  const handleStopEventSubmit = async (
    weight: number,
    type: string,
    finalLocation: string,
    // photo?: File, // Organizations don't currently upload photos for bulk stop
  ) => {
    try {
      // Calculate the capped checkout time (start time + maximum duration hours)
      const now = new Date();
      let checkOutTime = now.toISOString();
      if (eventCheckInTime) {
        const checkInDate = new Date(eventCheckInTime);
        const maxCheckOut = new Date(
          checkInDate.getTime() + dynamicDurationHours * 3600 * 1000,
        );

        // Prevent clock skew issues: checkOutDate cannot be before checkInDate
        let checkOutDate = now;
        if (checkOutDate < checkInDate) {
          checkOutDate = checkInDate;
        }

        checkOutTime =
          checkOutDate < maxCheckOut
            ? checkOutDate.toISOString()
            : maxCheckOut.toISOString();
      }

      const response = await apiService.stopEvent(eventId, {
        totalWeight: weight,
        location: finalLocation,
        garbageType: type,
        checkOutTime,
      });

      if (response && response.success) {
        // Commented out unused state setter to fix compiler warning TS6133
        // setIsEventStarted(false);
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
        // Commented out unused state setter to fix compiler warning TS6133
        // setLastScannedUserId(userId);
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
          {/* Calendar icon wrapper is flex items-center to keep the icon vertically centered relative to the multiline date/time layout */}
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#08351e] shrink-0" />
            <span className="flex-1 text-left">
              {renderEventDateTime()}
            </span>
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


      </div>

      <hr className="border-gray-200" />

      {/* Event description section with responsive layout and fallback logic */}
      {event.description && (
        <div>
          <h3 className="font-extrabold text-gray-800 mb-2">
            About this Event
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {event.description}
          </p>
        </div>
      )}
      {/* Event details section describing standard operating instructions */}
      {event.details && (
        <div>
          <h3 className="font-extrabold text-gray-800 mb-2">Details</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {event.details}
          </p>
        </div>
      )}
      {/* "Attendance Log" section displayed specifically to logged-in organizations showing checked-in attendees grouped by user ID */}
      {isOrganization && event.attendentUsers && event.attendentUsers.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-extrabold text-gray-800 mb-2 flex items-center gap-2">
            Attendance Log
          </h3>
          <div className="max-h-56 overflow-y-auto space-y-3 snap-y scroll-smooth pr-1">
            {(() => {
              // Group attendance logs by user ID to cluster multiple scans neatly under each attendee's name
              const grouped = (event.attendentUsers || []).reduce((acc: any, log: any) => {
                const userId = log.id;
                if (!acc[userId]) {
                  acc[userId] = {
                    name: log.name,
                    logs: []
                  };
                }
                acc[userId].logs.push(log);
                return acc;
              }, {});

              return Object.entries(grouped).map(([userId, groupData]: [string, any]) => (
                <div key={userId} className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 space-y-2 snap-start">
                  {/* Attendee Name Header Row */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                    <span className="font-bold text-gray-800 text-xs">{groupData.name}</span>
                    {/* <span className="text-[9px] font-black uppercase bg-[#86B537]/10 text-[#86B537] px-1.5 py-0.5 rounded-full">
                      {groupData.logs.length} {groupData.logs.length === 1 ? "Scan" : "Scans"}
                    </span> */}
                  </div>
                  {/* Nested Scans/Logs list for this volunteer */}
                  <div className="space-y-1">
                    {groupData.logs.map((log: any, idx: number) => {
                      const scanTimeStr = log.checkInTime || log.updatedAt;
                      let formattedTime = "N/A";
                      if (scanTimeStr) {
                        try {
                          const parsedDate = parseAsSingaporeTime(scanTimeStr);
                          // Format both date and time in SGT (Singapore Local Time)
                          formattedTime = parsedDate.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Singapore",
                          });
                        } catch (e) {
                          formattedTime = new Date(scanTimeStr).toLocaleString();
                        }
                      }
                      return (
                        <div
                          key={log.logId || idx}
                          // Clicking on the specific scan row opens the detail popup modal for that record
                          onClick={() => setSelectedAttendeeLog(log)}
                          className="cursor-pointer hover:bg-white border border-transparent hover:border-gray-100 flex items-center justify-between text-[11px] py-1 px-2 rounded-lg transition-colors"
                        >
                          <span className="text-gray-500 font-semibold">Scan #{idx + 1}: {formattedTime}</span>
                          <span className="text-[10px] underline text-gray-400 font-bold hover:text-[#86B537]">
                            Details
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
      {/* Event reward section highlighting achievements for completing cleanups */}
      {event.rewards && (
        <div>
          <h3 className="font-extrabold text-gray-800 mb-2">Reward</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-semibold text-[#08351e]">
            {event.rewards}
          </p>
        </div>
      )}

      {/* Join button — only for upcoming (not joined) events, if approved, and the event has not completed */}
      {!isActiveEvent && !isOrganization && event.status === "approved" && !isEventCompleted && (
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
              event.status === "approved" && !isEventCompleted ? (
                <div className="flex items-center gap-4">
                  {/*
                    Commented out Start/Stop Cleanup Event buttons and timer logic per user request.
                    Organizations now manually log cleanup activities from the dashboard.
                  */}
                  {/* {!isEventStarted ? ( */}
                    <>
                      {/* Render the QR scanner button for the organization creator only for private/registered events */}
                      {event.eventType !== "public" && (
                        <button
                          onClick={() => {
                            // Commented out unused state setter to fix compiler warning TS6133
                            // setLastScannedUserId(null);
                            setIsScanningQR(true);
                          }}
                          className="cursor-pointer flex items-center justify-center bg-[#E8F2FA] text-[#0083cf] p-2.5 rounded-full hover:bg-blue-100 transition-all border border-[#0083cf]/20"
                          title="Scan Attendance QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      )}
                      {/* <button
                        onClick={handleStartEvent}
                        className="cursor-pointer bg-[#96c93d] hover:bg-[#86b537] text-white font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-sm"
                      >
                        Start Cleanup Event
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm" title="Time remaining for cleanup event">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-bold tabular-nums text-sm">
                          {formatTime(orgRemainingSeconds)}
                        </span>
                      </div>
                      <button
                        onClick={() => setStopModalOpen(true)}
                        disabled={orgStopButtonDisabled}
                        className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all ${orgStopButtonDisabled
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : "cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
                          }`}
                        title={
                          orgStopButtonDisabled
                            ? `Must run the event for at least ${Math.min(ORG_MIN_DURATION_MINUTES, dynamicDurationHours * 60)} minutes before stopping`
                            : undefined
                        }
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>Stop Cleanup</span>
                      </button> */}
                    </>
                  {/* )} */}
                </div>
              ) : null
            ) : (
              <>
                {/* 
                  Commented out volunteer check-in timer session, "Start Clean-up", and "Stop Clean-up" buttons 
                  since the logging flow is now manual from the dashboard.
                */}
                {/*
                {isActiveEvent &&
                  sessionState === "idle" &&
                  event.eventType !== "private" &&
                  event.status === "approved" &&
                  !isEventCompleted && (
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
                      className={`cursor-pointer font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-white text-sm ${userStats && (userStats.todayHours || 0) >= 2
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
                  event.eventType !== "private" &&
                  event.status === "approved" && (
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
                        className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all ${stopButtonDisabled
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
                */}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {event.status === "approved" && isEventCompleted && (
              <div className="flex justify-center items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4fff5] text-[#86B537] border border-[#a8e8bd] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
              </div>
            )}
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
            event.status === "approved" && !isEventCompleted ? (
              <div className="flex items-center gap-4 w-full justify-between">
                {/*
                  Commented out Start/Stop Cleanup Event buttons and timer logic per user request.
                  Organizations now manually log cleanup activities from the dashboard.
                */}
                {/* {!isEventStarted ? ( */}
                  <>
                    {/* Render the QR scanner button for the organization creator only for private/registered events */}
                    {event.eventType !== "public" && (
                      <button
                        onClick={() => {
                          // Commented out unused state setter to fix compiler warning TS6133
                          // setLastScannedUserId(null);
                          setIsScanningQR(true);
                        }}
                        className="cursor-pointer flex items-center justify-center bg-[#E8F2FA] text-[#0083cf] p-2.5 rounded-full hover:bg-blue-100 transition-all border border-[#0083cf]/20"
                        title="Scan Attendance QR Code"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    )}
                    {/* <button
                      onClick={handleStartEvent}
                      className="cursor-pointer bg-[#96c93d] hover:bg-[#86b537] text-white font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-sm"
                    >
                      Start Cleanup Event
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2 rounded-full text-[#08351e] shadow-sm" title="Time remaining for cleanup event">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold tabular-nums text-sm">
                        {formatTime(orgRemainingSeconds)}
                      </span>
                    </div>
                    <button
                      onClick={() => setStopModalOpen(true)}
                      disabled={orgStopButtonDisabled}
                      className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all ${orgStopButtonDisabled
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                          : "cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
                        }`}
                      title={
                        orgStopButtonDisabled
                          ? `Must run the event for at least ${Math.min(ORG_MIN_DURATION_MINUTES, dynamicDurationHours * 60)} minutes before stopping`
                          : undefined
                      }
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop Cleanup</span>
                    </button> */}
                  </>
                {/* )} */}
              </div>
            ) : null
          ) : (
            <>
              {/* 
                Commented out volunteer check-in timer session, "Start Clean-up", and "Stop Clean-up" buttons 
                since the logging flow is now manual from the dashboard.
              */}
              {/*
              {isActiveEvent &&
                sessionState === "idle" &&
                event.eventType !== "private" &&
                event.status === "approved" &&
                !isEventCompleted && (
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
                    className={`cursor-pointer font-extrabold px-6 py-2.5 rounded-full shadow-sm transition-colors active:scale-95 text-white text-sm ${userStats && (userStats.todayHours || 0) >= 2
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
                event.eventType !== "private" &&
                event.status === "approved" && (
                  <div className="flex justify-evenly w-full gap-3">
                    <div className="flex items-center gap-1.5">
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
                      className={`w-44 h-10 cursor-pointer font-extrabold rounded-full text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all ${stopButtonDisabled
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
              */}
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


      </div>

      {/* Desktop split-screen layout displaying the event image on the left and the detailed EventInfoCard on the right */}
      <div className="hidden lg:block">
        <div className="max-w-8xl mx-auto px-8 xl:px-12 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            {/* Left Section: Sticky Event Image for interactive scrolling experience on desktop */}
            <div className="lg:col-span-6 w-full h-[400px] rounded-[2rem] overflow-hidden shadow-sm lg:sticky lg:top-24">
              <img
                src={getEventImageUrl(event.eventImage)}
                className="w-full h-full object-cover"
                alt={event.name}
              />
            </div>
            {/* Right Section: Detailed Event Information Card containing details, description, rewards, and checked-in logs */}
            <div className="lg:col-span-6">
              <EventInfoCard />
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

      {/* Details modal popup showing the check-in/out times, hours, and trash metrics of the selected attendee */}
      {selectedAttendeeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 border border-gray-100 animate-in zoom-in-95 text-left relative">
            <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-6 border-b border-gray-50 pb-4 flex items-center justify-between">
              <span>Attendance Details</span>
              <button 
                onClick={() => setSelectedAttendeeLog(null)} 
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </h3>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Name</span>
                <span className="text-sm font-bold text-gray-800">{selectedAttendeeLog.name}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Worked Date & Time</span>
                <div className="text-xs text-gray-600 font-medium space-y-1.5 bg-gray-50/50 border border-gray-100 p-3 rounded-xl mt-1">
                  <div>
                    <span className="text-gray-400 font-bold mr-1.5">Checked In:</span>
                    <span className="text-gray-700 font-semibold">{formatAttendeeLogDateTime(selectedAttendeeLog.checkInTime)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold mr-1.5">Checked Out:</span>
                    {selectedAttendeeLog.checkOutTime ? (
                      <span className="text-gray-700 font-semibold">{formatAttendeeLogDateTime(selectedAttendeeLog.checkOutTime)}</span>
                    ) : (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-[10px] border border-green-100 uppercase tracking-wide">Active / In Progress</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Spent</span>
                <span className="text-sm font-bold text-gray-800">
                  {selectedAttendeeLog.totalHours !== null && selectedAttendeeLog.totalHours !== undefined ? (
                    `${Number(selectedAttendeeLog.totalHours).toFixed(2)} hours`
                  ) : (
                    <span className="text-gray-400 font-medium italic">Active / In Progress</span>
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Garbage Collected</span>
                <span className="text-sm font-bold text-gray-800">
                  {selectedAttendeeLog.garbageWeight !== null && selectedAttendeeLog.garbageWeight !== undefined ? (
                    `${Number(selectedAttendeeLog.garbageWeight).toFixed(2)} kg`
                  ) : (
                    "0.00 kg"
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Garbage Type</span>
                <span className="text-sm font-semibold text-gray-700 bg-gray-50/50 border border-gray-100 px-3 py-2 rounded-xl mt-1 block">
                  {selectedAttendeeLog.garbageType || "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedAttendeeLog(null)}
                className="cursor-pointer bg-[#08351e] hover:bg-[#0a4527] text-white font-extrabold px-6 py-2.5 rounded-full text-xs shadow-md transition-colors active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        Commented out volunteer-side Duration Picker Modal and Log Activity Form rendering blocks
        since the logging flow is now manual from the dashboard.
      */}
      {/*
      {sessionState === "selecting_duration" && (
        <DurationSelectModal
          onSelect={handleDurationSelected}
          onCancel={cancelDurationPicker}
          todayHours={userStats?.todayHours || 0}
          eventDurationHours={dynamicDurationHours}
        />
      )}

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
      */}

      {/* Organization Stop Event Form */}
      {stopModalOpen && isCreator && (
        <LogActivityForm
          eventName={event?.name}
          elapsedSeconds={Math.min(elapsedOrgSeconds, orgDurationSeconds)}
          location={event?.location || ""}
          onCancel={() => setStopModalOpen(false)}
          onSubmit={handleStopEventSubmit}
        />
      )}
      {/* QR Code Scanner Simulation Modal */}
      {isScanningQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#1e1e1e] text-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-800 relative overflow-hidden animate-in zoom-in-95">
            {/* Holographic Header with pulsing green scanned count badge */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex flex-col items-center justify-center mb-3 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                <span className="text-3xl font-black tracking-tight leading-none text-green-400">
                  {(() => {
                    // Extract scanned count dynamically by parsing the attendee participant list safely
                    if (!event || !event.attendentParticipant) return 0;
                    let attendees = event.attendentParticipant;
                    if (typeof attendees === "string") {
                      try {
                        attendees = JSON.parse(attendees);
                      } catch {
                        attendees = [];
                      }
                    }
                    return (attendees as string[]).length;
                  })()}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-green-500/70">
                  Scanned
                </span>
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
