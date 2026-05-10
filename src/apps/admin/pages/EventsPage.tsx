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
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EventFormPage } from "../../../components/sections/admin/modal/EventFormPage";
import { adminApiService } from "../../../services/adminApiService";
import type { EventData, UserProfile } from "../../../types/api.types";
import { format } from "date-fns";
// import { getEventImageUrl } from "../../../utils/imageUtils";
import { LazyEventImage } from "../../../components/ui/LazyEventImage";

interface DeleteState {
  eventId: string | null;
  loading: boolean;
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "organization">("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    eventId: null,
    loading: false,
  });

  const loadEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [eventsData, usersData, organizationsData] = await Promise.all([
        adminApiService.getAllEvents(),
        adminApiService.getAllUsers(),
        adminApiService.getAllOrganizations(),
      ]);
      setEvents(eventsData);
      setUsers(usersData);
      setOrganizations(organizationsData);
    } catch (err) {
      console.error("loadEvents error", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const adminIds = useMemo(() => {
    return users.filter((u) => u.role === "admin").map((u) => u.id);
  }, [users]);

  const filtered = useMemo(() => {
    let result = events;

    if (activeTab === "all") {
      result = events.filter((e) => e.status === "approved");
    } else if (activeTab === "organization") {
      result = events.filter((e) => e.createdBy && !adminIds.includes(e.createdBy));
    }

    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [events, search, activeTab, adminIds]);

  const handleDelete = async (eventId: string) => {
    setDeleteState({ eventId, loading: true });
    try {
      const ok = await adminApiService.deleteEvent(eventId);
      if (ok) {
        toast.success("Event deleted successfully");
        setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
        // Dispatch event to refresh sidebar counts immediately
        window.dispatchEvent(new CustomEvent("refresh-admin-counts"));
      } else {
        toast.error("Failed to delete event");
      }
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleteState({ eventId: null, loading: false });
    }
  };

  const handleStatusUpdate = async (eventId: string, status: "approved" | "rejected") => {
    try {
      await adminApiService.updateEventStatus(eventId, status);
      toast.success(`Event ${status} successfully`);
      loadEvents();
      // Dispatch event to refresh sidebar counts immediately
      window.dispatchEvent(new CustomEvent("refresh-admin-counts"));
    } catch (error) {
      toast.error(`Failed to ${status} event`);
    }
  };
  const handleFormSuccess = (newEvent?: EventData) => {
    if (newEvent) {
      setEvents((prev) => {
        const exists = prev.find((e) => e.eventId === newEvent.eventId);
        if (exists) {
          return prev.map((e) => (e.eventId === newEvent.eventId ? newEvent : e));
        }
        return [newEvent, ...prev];
      });
      // Optionally refresh in background to ensure sync
      loadEvents(true);
    } else {
      loadEvents();
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

  if (formOpen) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFormOpen(false)}
            className="cursor-pointer p-2.5 rounded-xl border border-[#E8EDF2] hover:bg-gray-100 transition-colors text-[#1A2A3A] hover:text-[#86B537] shadow-xs flex items-center justify-center bg-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A2A3A] tracking-tight">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-sm text-[#8A9AA8] font-medium mt-0.5">
              {editingEvent ? "Modify the fields below to update the event" : "Fill in the fields below to launch a new event"}
            </p>
          </div>
        </div>
        <EventFormPage
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
          editingEvent={editingEvent}
          isPage={true}
        />
      </div>
    );
  }

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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E8EDF2] pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "all"
              ? "border-[#86B537] text-[#86B537]"
              : "border-transparent text-[#8A9AA8] hover:text-[#1A2A3A]"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setActiveTab("organization")}
          className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "organization"
              ? "border-[#86B537] text-[#86B537]"
              : "border-transparent text-[#8A9AA8] hover:text-[#1A2A3A]"
          }`}
        >
          Organization Created
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
            const eventDate = new Date(event.startDate);
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
                  <LazyEventImage
                    imagePath={event.eventImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

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

                  {/* Location, Participants and Inline Status Badge per reference */}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7A88] font-medium">
                        <MapPin size={12} className="text-[#8A9AA8] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#8A9AA8] font-medium">
                        <Users size={12} className="shrink-0" />
                        <span>
                          {event.joinsCount ?? 0} participant
                          {(event.joinsCount ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    {/* Right-floating Status Pill */}
                    {event.status === "approved" && activeTab === "organization" && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#86B537] text-[#86B537] text-[11px] font-bold shadow-xs shrink-0 bg-transparent">
                        <CheckCircle2 size={12} />
                        <span>Approved</span>
                      </div>
                    )}
                    {event.status === "rejected" && activeTab === "organization" && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-red-500 text-red-500 text-[11px] font-bold shadow-xs shrink-0 bg-transparent">
                        <XCircle size={12} />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>

                  {event.rewards && (
                    <p
                      className="text-[11px] font-semibold mb-1"
                      style={{ color: "#86B537" }}
                    >
                      🏆 {event.rewards}
                    </p>
                  )}

                  {(() => {
                    const creator = users.find((u) => u.id === event.createdBy) || (() => {
                      const org = organizations.find((o) => o.orgId === event.createdBy);
                      if (!org) return null;
                      return {
                        name: org.orgName || org.name,
                        email: org.email
                      };
                    })();
                    if (!creator) return null;
                    return (
                      <div className="border-t border-[#E8EDF2] pt-2 mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A9AA8] leading-none mb-1">
                          Created By Organization:
                        </p>
                        <p className="text-xs font-semibold text-[#1A2A3A]">
                          {creator.name}
                        </p>
                        <p className="text-[11px] font-medium text-[#8A9AA8] truncate">
                          {creator.email}
                        </p>
                      </div>
                    );
                  })()}

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
                        >
                          {deleteState.loading ? (
                            <Loader2 size={12} className="animate-spin mx-auto" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteState({ eventId: null, loading: false })}
                          className="cursor-pointer flex-1 py-1.5 rounded-md bg-[#F5F7FA] text-[#6B7A88] text-xs font-semibold transition hover:bg-[#E8EDF2]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : event.status === "pending" ? (
                    <div className="mt-auto flex flex-col gap-2 pt-1">
                      <div className="text-xs font-semibold text-[#F5A623] bg-[#FFF8E7] px-2.5 py-1 rounded w-fit self-start mb-1 border border-[#FFE8B3]">
                        ⏳ Pending Approval
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(event.eventId, "approved")}
                          className="cursor-pointer flex-1 py-1.5 rounded-md bg-[#86B537] text-white text-xs font-semibold transition hover:bg-[#7aa632]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(event.eventId, "rejected")}
                          className="cursor-pointer flex-1 py-1.5 rounded-md bg-[#E8F2FA] text-[#108ACB] text-xs font-semibold transition hover:bg-[#D4EAF8]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Updated outline-style Action buttons section based on reference screenshot */
                    <div className="mt-auto">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(event)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E8EDF2] bg-transparent text-xs font-semibold text-[#1A2A3A] hover:border-[#108ACB] hover:text-[#108ACB] transition-all shadow-xs"
                        >
                          <Pencil size={13} />
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
                          className="cursor-pointer flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-[#E8EDF2] bg-transparent text-[#8A9AA8] hover:border-red-500 hover:text-red-500 transition-all shadow-xs"
                        >
                          {isDeleting ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
