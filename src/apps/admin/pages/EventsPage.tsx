/**
 * EventsPage.tsx
 * Professional event management with tabs for upcoming/past, create/edit/delete.
 * Theme colors: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  PlusCircle,
  MapPin,
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { EventFormModal } from "../../../components/modal/EventFormModal";
import { adminApiService } from "../../../services/adminApiService";
import type { EventData } from "../../../types/apiTypes";
import { format } from "date-fns";
import { getEventImageUrl } from "../../../utils/imageUtils";

interface DeleteState {
  eventId: string | null;
  loading: boolean;
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    eventId: null,
    loading: false,
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getAllEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filtered = useMemo(() => {
    if (!search) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [events, search]);

  const handleDelete = async (eventId: string) => {
    setDeleteState({ eventId, loading: true });
    try {
      const ok = await adminApiService.deleteEvent(eventId);
      if (ok) {
        toast.success("Event deleted successfully");
        setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
      } else {
        toast.error("Failed to delete event");
      }
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleteState({ eventId: null, loading: false });
    }
  };

  const openCreate = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const openEdit = (event: EventData) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
            Events
          </h1>
          <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
            {loading ? "Loading..." : `${events.length} total events`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90"
          style={{ background: "#86B537" }}
        >
          <PlusCircle size={16} />
          Create Event
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-[#E8EDF2] p-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by name or location..."
            className="w-full pl-8 pr-4 py-2 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden"
            >
              <div className="h-40 bg-[#F5F7FA] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#F5F7FA] rounded-lg animate-pulse w-3/4" />
                <div className="h-3 bg-[#F5F7FA] rounded-lg animate-pulse w-1/2" />
                <div className="h-3 bg-[#F5F7FA] rounded-lg animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8EDF2] py-20 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            style={{ background: "#F5F7FA" }}
          >
            <CalendarDays size={32} style={{ color: "#A0AAB5" }} />
          </div>
          <p className="mt-4 text-[#1A2A3A] font-semibold text-base">
            No events found
          </p>
          <p className="text-[#8A9AA8] text-sm mt-1">
            Create a new event using the "Create Event" button above to get
            started.
          </p>
          {/* <button
            onClick={openCreate}
            className="mt-4 px-5 py-2.5 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: "#86B537" }}
          >
            <PlusCircle size={15} />
            Create First Event
          </button> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((event) => {
            const eventDate = new Date(event.date);
            const isDeleting = deleteState.eventId === event.eventId;
            const confirmDelete =
              deleteState.eventId === event.eventId && !deleteState.loading;

            return (
              <div
                key={event.eventId}
                className="bg-white rounded-xl border border-[#E8EDF2] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-40 bg-linear-to-br from-[#F5F7FA] to-[#E8EDF2] overflow-hidden shrink-0">
                  {event.eventImage ? (
                    <img
                      src={getEventImageUrl(event.eventImage)}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays size={32} className="text-[#A0AAB5]" />
                    </div>
                  )}

                  {/* Date overlay badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 shadow-sm text-center min-w-[44px]">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8A9AA8] leading-none">
                      {format(eventDate, "MMM")}
                    </p>
                    <p className="text-lg font-bold text-[#1A2A3A] leading-tight">
                      {format(eventDate, "d")}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 pt-3 pb-2 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-[#1A2A3A] tracking-tight leading-tight line-clamp-2 mb-1.5">
                    {event.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#6B7A88] font-medium mb-1">
                    <MapPin size={11} className="text-[#8A9AA8] shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#8A9AA8] font-medium mb-3">
                    <Users size={11} className="shrink-0" />
                    <span>{event.joinsCount ?? 0} participants</span>
                  </div>

                  {event.rewards && (
                    <p
                      className="text-[11px] font-semibold mb-2"
                      style={{ color: "#86B537" }}
                    >
                      🏆 {event.rewards}
                    </p>
                  )}

                  {/* Delete confirmation - Updated to use blue instead of pink */}
                  {confirmDelete ? (
                    <div
                      className="mt-auto rounded-lg p-3"
                      style={{
                        background: "#E8F2FA",
                        border: "1px solid #D4EAF8",
                      }}
                    >
                      <p
                        className="text-xs font-semibold mb-2 leading-snug"
                        style={{ color: "#108ACB" }}
                      >
                        Delete "{event.name}"? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(event.eventId)}
                          className="cursor-pointer flex-1 py-1.5 rounded-md text-white text-xs font-semibold transition"
                          style={{ background: "#108ACB" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0E6EAD";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#108ACB";
                          }}
                        >
                          {deleteState.loading ? (
                            <Loader2
                              size={12}
                              className="animate-spin mx-auto"
                            />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteState({ eventId: null, loading: false })
                          }
                          className="cursor-pointer flex-1 py-1.5 rounded-md bg-[#F5F7FA] text-[#6B7A88] text-xs font-semibold transition hover:bg-[#E8EDF2]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action buttons - Updated delete button to use blue/green */
                    <div className="mt-auto flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(event)}
                        className="cursor-pointer  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "#E8F2FA", color: "#108ACB" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#D4EAF8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#E8F2FA";
                        }}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteState({
                            eventId: event.eventId,
                            loading: false,
                          })
                        }
                        disabled={isDeleting}
                        className="cursor-pointer flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "#F0F7E4", color: "#86B537" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#E6F3DA";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#F0F7E4";
                        }}
                      >
                        {isDeleting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <EventFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={loadEvents}
        editingEvent={editingEvent}
      />
    </div>
  );
};
