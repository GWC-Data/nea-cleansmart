import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Medal,
  Share2,
} from "lucide-react";
import { apiService } from "../../../services/apiService";
import type { EventData } from "../../../services/apiService";
import logo from "../../../assets/publicHygineCouncil.png";
import { toast } from "sonner";

const BADGES = [
  {
    label: "Silver",
    points: 50,
    color: "bg-[#bbf7d0]",
    border: "border-green-200",
    icon: "text-[#0a4527]",
  },
  {
    label: "Gold",
    points: 100,
    color: "bg-[#fde68a]",
    border: "border-yellow-200",
    icon: "text-yellow-800",
  },
  {
    label: "Diamond",
    points: 150,
    color: "bg-[#e2e8f0]",
    border: "border-slate-200",
    icon: "text-slate-700",
  },
];

const RewardsBadgesCard: React.FC<{ rewards: string }> = ({ rewards }) => (
  <div className="bg-[#fcf8f2] rounded-[2rem] p-6 shadow-sm border border-orange-50/50">
    <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight mb-1">
      Rewards & Badges
    </h3>
    <p className="text-xs text-gray-400 font-medium mb-5 leading-relaxed">
      Complete clean-up hours to unlock badges and rewards.
    </p>
    <div className="flex flex-col gap-3">
      {BADGES.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm"
        >
          <div
            className={`${badge.color} p-3 rounded-full border ${badge.border} shrink-0`}
          >
            <Medal className={`w-5 h-5 ${badge.icon}`} />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-800 text-sm">
              {badge.label}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              {badge.points} points required
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-5 bg-white rounded-2xl px-4 py-3 border border-gray-100">
      <p className="text-xs text-gray-500 font-medium leading-relaxed">
        🎁 <span className="font-bold text-gray-700">Rewards: </span>
        {rewards}
      </p>
    </div>
  </div>
);

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
  const [event, setEvent] = useState<EventData | null>(null);
  const [modalView, setModalView] = useState<"none" | "confirm" | "success">(
    "none",
  );
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function load() {
      const events = await apiService.getEvents();
      const found = events.find((e) => e.eventId === Number(eventId));
      setEvent(found || null);
    }
    load();
  }, [eventId]);

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium">
        Loading event...
      </div>
    );

  const profStr = localStorage.getItem("nea_user_profile");
  const userProfile = profStr ? JSON.parse(profStr) : null;
  const isAlreadyJoined = userProfile?.joinedEvents?.includes(event.eventId);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleConfirmJoin = async () => {
    if (!profStr) return;
    setIsJoining(true);
    try {
      const userId = userProfile.id;
      await Promise.all([
        apiService.joinEvent(event.eventId, userId),
        apiService.updateUserJoinedEvents(userId, event.eventId),
      ]);

      // Sync localStorage
      const profile = JSON.parse(profStr);
      if (!profile.joinedEvents) profile.joinedEvents = [];
      if (!profile.joinedEvents.includes(event.eventId)) {
        profile.joinedEvents.push(event.eventId);
      }
      localStorage.setItem("nea_user_profile", JSON.stringify(profile));
      window.dispatchEvent(new Event("storage"));

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

  // ── Shared Join Button ───────────────────────────────────────────────────
  const JoinButton: React.FC<{ fullWidth?: boolean }> = ({ fullWidth }) => (
    <button
      onClick={() => setModalView("confirm")}
      className={`bg-[#08351e] hover:bg-[#0a4527] text-white font-extrabold py-3.5 rounded-full shadow-sm transition-colors active:scale-95
        ${fullWidth ? "w-full text-base" : "mt-2 self-start px-10"}`}
    >
      Yes, Join Event
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white px-5 sm:px-8 lg:px-12 py-4 sticky top-0 z-40 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Share button — always visible, no auth required */}
        {/* <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: event?.name, url });
            } else {
              navigator.clipboard.writeText(url);
              toast.success("Link copied to clipboard!");
            }
          }}
          className="ml-auto mr-4 flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-full transition-colors hover:bg-gray-50"
        >
          <Share2 className="w-4 h-4" /> Share
        </button> */}

        <img
          src={logo}
          alt="Public Hygiene Council"
          className="h-10 w-auto ml-auto"
        />
      </header>

      {/* ── Mobile & Tablet ────────────────────────────────────────────────── */}
      <div className="lg:hidden px-5 sm:px-8 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <div className="w-full h-52 sm:h-64 rounded-[1.5rem] overflow-hidden shadow-sm">
          <img
            src={`https://picsum.photos/seed/${event.eventId}/900/400`}
            className="w-full h-full object-cover"
            alt={event.name}
          />
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {event.name}
            </h1>
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: event.name, url });
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                }
              }}
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
            <h3 className="font-extrabold text-gray-800 mb-1.5">
              About this Event
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {event.description}
            </p>
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 mb-1.5">Details</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {event.details}
            </p>
          </div>
        </div>

        <RewardsBadgesCard rewards={event.rewards} />

        {!isAlreadyJoined && <JoinButton fullWidth />}
      </div>

      {/* ── Desktop ────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="max-w-5xl xl:max-w-6xl mx-auto px-8 xl:px-12 py-10">
          <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
            <div className="col-span-8 flex flex-col gap-6">
              <div className="w-full h-64 xl:h-72 rounded-[2rem] overflow-hidden shadow-sm">
                <img
                  src={`https://picsum.photos/seed/${event.eventId}/900/400`}
                  className="w-full h-full object-cover"
                  alt={event.name}
                />
              </div>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    {event.name}
                  </h1>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        navigator.share({ title: event.name, url });
                      } else {
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard!");
                      }
                    }}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-full transition-colors hover:bg-gray-50"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
                <div className="flex flex-col gap-2 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#08351e]" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#08351e]" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#08351e]" />
                    {event.joinsCount} participant
                    {event.joinsCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <h3 className="font-extrabold text-gray-800 mb-2">
                    About this Event
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 mb-2">Details</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {event.details}
                  </p>
                </div>
                {!isAlreadyJoined && <JoinButton />}
              </div>
            </div>

            <div className="col-span-4">
              <div className="sticky top-24">
                <RewardsBadgesCard rewards={event.rewards} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
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
