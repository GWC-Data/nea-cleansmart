/**
 * EventDetailModal.tsx
 * Popup modal to display full event details when clicking an event card.
 * Supports all event statuses, types, and creator info resolution.
 */

import React from "react";
import {
  X,
  CalendarDays,
  Clock,
  MapPin,
  // Users,
  FileText,
  Trophy,
  // Pencil,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { LazyEventImage } from "../../../ui/LazyEventImage";
import type { EventData, UserProfile } from "../../../../types/api.types";

interface EventDetailModalProps {
  /** The event to display in the modal */
  event: EventData;
  /** List of users for resolving creator info */
  users: UserProfile[];
  /** List of organizations for resolving creator info */
  organizations: any[];
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to open the edit form for this event */
  onEdit: (event: EventData) => void;
}

/**
 * Formats ISO date strings for display without timezone conversion.
 * Strips trailing Z or offset to preserve the original stored time.
 */
const formatEventDate = (dateStr: string) => {
  if (!dateStr) return "\u2014";
  try {
    const clean = dateStr.replace(/Z$|[+-]\d{2}:\d{2}$/, "");
    const d = new Date(clean);
    return format(d, "MMM dd, yyyy, hh:mm aa");
  } catch {
    return dateStr;
  }
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  users,
  organizations,
  onClose,
  // onEdit,
}) => {
  /**
   * Resolves the creator of the event from users or organizations list.
   * Falls back to null if the creator is not found.
   */
  const resolveCreator = () => {
    const userCreator = users.find((u) => u.id === event.createdBy);
    if (userCreator) return { name: userCreator.name, email: userCreator.email };

    const org = organizations.find((o: any) => o.orgId === event.createdBy);
    if (org) return { name: org.orgName || org.name, email: org.email };

    return null;
  };

  const creator = resolveCreator();

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop overlay with blur effect */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal content container */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#6B7A88] hover:text-[#1A2A3A] transition shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Event image banner section */}
        <div className="relative h-52 bg-linear-to-br from-[#F5F7FA] to-[#E8EDF2] overflow-hidden rounded-t-2xl">
          <LazyEventImage
            imagePath={event.eventImage}
            alt={event.name}
            className="w-full h-full object-cover"
          />

          {/* Status badge overlay - top left */}
          <div className="absolute top-3 left-3">
            {event.status === "approved" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#86B537]/90 text-white text-xs font-bold shadow">
                <CheckCircle2 size={12} /> Approved
              </span>
            )}
            {event.status === "pending" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5A623]/90 text-white text-xs font-bold shadow">
                ⏳ Pending
              </span>
            )}
            {event.status === "rejected" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold shadow">
                <XCircle size={12} /> Rejected
              </span>
            )}
          </div>

          {/* Event type badge - top right */}
          {event.eventType && (
            <div className="absolute top-3 right-12">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow ${
                  event.eventType === "public"
                    ? "bg-[#509CD1]/90 text-white"
                    : "bg-[#8A9AA8]/90 text-white"
                }`}
              >
                {event.eventType === "public" ? "Public" : "Private"}
              </span>
            </div>
          )}
        </div>

        {/* Modal body content */}
        <div className="p-5 space-y-4">
          {/* Event name heading */}
          <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight leading-snug">
            {event.name}
          </h2>

          {/* Key info grid - responsive 2-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start Date card */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8EDF2]">
              <CalendarDays size={16} className="text-[#86B537] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-0.5">
                  Start Date
                </p>
                <p className="text-xs font-semibold text-[#1A2A3A]">
                  {formatEventDate(event.startDate)}
                </p>
              </div>
            </div>

            {/* End Date card */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8EDF2]">
              <Clock size={16} className="text-[#509CD1] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-0.5">
                  End Date
                </p>
                <p className="text-xs font-semibold text-[#1A2A3A]">
                  {formatEventDate(event.endDate)}
                </p>
              </div>
            </div>

            {/* Location card */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8EDF2]">
              <MapPin size={16} className="text-[#108ACB] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-0.5">
                  Location
                </p>
                <p className="text-xs font-semibold text-[#1A2A3A]">
                  {event.location}
                </p>
              </div>
            </div>

            {/* Create By section */}
            <div className="border-t border-[#E8EDF2] pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-1">
                Created By
              </p>
              <p className="text-sm font-semibold text-[#1A2A3A]">
                {creator?.name}
              </p>
              <p className="text-xs text-[#8A9AA8]">{creator?.email}</p>
            </div>
            {/* Participants card */}
            {/* <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7FA] border border-[#E8EDF2]">
              <Users size={16} className="text-[#86B537] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-0.5">
                  Participants
                </p>
                <p className="text-xs font-semibold text-[#1A2A3A]">
                  {event.joinsCount ?? 0}
                  {event.userCount ? ` / ${event.userCount}` : ""}
                </p>
              </div>
            </div> */}
          </div>

          {/* Description section - conditionally rendered */}
          {event.description && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={14} className="text-[#8A9AA8]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8]">
                  Description
                </p>
              </div>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Details section - conditionally rendered */}
          {event.details && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={14} className="text-[#8A9AA8]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8]">
                  Details
                </p>
              </div>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                {event.details}
              </p>
            </div>
          )}

          {/* Rewards section - highlighted with green accent */}
          {event.rewards && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Trophy size={14} className="text-[#8A9AA8]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8]">
                  Rewards
                </p>
              </div>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                {event.rewards}
              </p>
            </div>
          )}

          {/* Creator info section - resolved from users or organizations */}
          {/* {creator && (
            <div className="border-t border-[#E8EDF2] pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] mb-1">
                Created By
              </p>
              <p className="text-sm font-semibold text-[#1A2A3A]">
                {creator.name}
              </p>
              <p className="text-xs text-[#8A9AA8]">{creator.email}</p>
            </div>
          )} */}

          {/* Action buttons at bottom of modal */}
          {/* <div className="flex gap-2 pt-2 border-t border-[#E8EDF2]">
            <button
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E8EDF2] bg-transparent text-sm font-semibold text-[#1A2A3A] hover:border-[#108ACB] hover:text-[#108ACB] transition-all"
            >
              <Pencil size={14} />
              Edit Event
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 py-2.5 rounded-xl bg-[#F5F7FA] text-sm font-semibold text-[#6B7A88] hover:bg-[#E8EDF2] transition-all"
            >
              Close
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};
