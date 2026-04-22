/**
 * EventsPage.tsx
 * Full event management — tabs for upcoming/past, create/edit/delete.
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
import { EventFormModal } from "../../../components/admin/EventFormModal";
import { adminApiService } from "../../../services/adminApiService";
import type { EventData } from "../../../types/apiTypes";
import { format } from "date-fns";

// ─── Delete confirmation inline state ────────────────────────────────────────

interface DeleteState {
  eventId: string | null;
  loading: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"active" | "past">("active");

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

  const now = new Date();

  const filtered = useMemo(() => {
    const byTab =
      tab === "active"
        ? events.filter((e) => new Date(e.date) >= now)
        : events.filter((e) => new Date(e.date) < now);
    if (!search) return byTab;
    const q = search.toLowerCase();
    return byTab.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [events, tab, search, now]);

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
    <div className="animate-slide-up space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Events
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            {loading ? "Loading…" : `${events.length} total events`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-black shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#96c93d" }}
          id="create-event-btn"
        >
          <PlusCircle size={16} />
          Create Event
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["active", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "active" ? "Active Events" : "Past Events"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
            id="events-search"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
                <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <span className="text-5xl">📅</span>
          <p className="mt-4 text-gray-700 font-black text-base">
            No {tab} events found
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {tab === "active"
              ? 'Create a new event using the "Create Event" button above.'
              : "Past events will appear here once events conclude."}
          </p>
          {tab === "active" && (
            <button
              onClick={openCreate}
              className="mt-4 px-5 py-2.5 rounded-full text-white text-sm font-black inline-flex items-center gap-2"
              style={{ background: "#96c93d" }}
            >
              <PlusCircle size={15} />
              Create First Event
            </button>
          )}
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
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shrink-0">
                  {event.eventImage ? (
                    <img
                      src={event.eventImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays size={32} className="text-gray-300" />
                    </div>
                  )}

                  {/* Date overlay badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 shadow-md text-center min-w-[44px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">
                      {format(eventDate, "MMM")}
                    </p>
                    <p className="text-lg font-black text-gray-900 leading-tight">
                      {format(eventDate, "d")}
                    </p>
                  </div>

                  {/* Past label */}
                  {tab === "past" && (
                    <div className="absolute top-3 right-3 bg-black/50 rounded-lg px-2 py-0.5">
                      <span className="text-white text-[10px] font-black">
                        Past
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="px-4 pt-3 pb-2 flex-1 flex flex-col">
                  <h3 className="text-sm font-black text-gray-900 tracking-tight leading-tight line-clamp-2 mb-1.5">
                    {event.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
                    <Users size={11} className="shrink-0" />
                    <span>{event.joinsCount ?? 0} participants</span>
                  </div>

                  {event.rewards && (
                    <p className="text-[11px] text-[#25935f] font-bold mb-2">
                      🏆 {event.rewards}
                    </p>
                  )}

                  {/* Delete confirmation */}
                  {confirmDelete ? (
                    <div className="mt-auto rounded-2xl bg-red-50 border border-red-100 p-3">
                      <p className="text-xs text-red-600 font-bold mb-2 leading-snug">
                        Delete <em>{event.name}</em>? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(event.eventId)}
                          className="flex-1 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black transition hover:bg-red-700"
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
                          className="flex-1 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-black transition hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action buttons */
                    <div className="mt-auto flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(event)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl border border-blue-200 bg-blue-50 text-[#107acc] text-xs font-black hover:bg-blue-100 transition-colors"
                        id={`edit-event-${event.eventId}`}
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
                        className="flex items-center justify-center px-3 py-2 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-xs font-black hover:bg-red-100 transition-colors"
                        id={`delete-event-${event.eventId}`}
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
