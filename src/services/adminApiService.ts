/**
 * adminApiService.ts
 * All admin-specific API calls for the NEA CleanTrack Admin Panel.
 * Uses native fetch() with JWT bearer token auth.
 */

import { ENV } from "../config/env";
import bcrypt from "bcryptjs";

const FRONTEND_SALT = "$2a$10$Xxxxxxxxxxxxxxxxxxxxxx";
import { getAdminToken } from "../utils/tokenUtils";
import type {
  EventData,
  UserProfile,
  EventLog,
  LeaderboardEntry,
  FullUserProfile,
} from "../types/api.types";
import type { CreateEventPayload, PlatformStats } from "../types/admin.types";

const BASE = ENV.API_BASE_URL;

const adminHeaders = (
  extra: Record<string, string> = {},
): Record<string, string> => {
  const token = getAdminToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const adminApiService = {
  // ============================================================
  // AUTH
  // ============================================================

  /**
   * Login with email and password
   */
  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    tokenExpiry: number;
    user: UserProfile;
  } | null> {
    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: bcrypt.hashSync(password, FRONTEND_SALT) }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      return await response.json();
    } catch (error) {
      console.error("adminApiService.login error:", error);
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BASE}/users/details`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("adminApiService.getCurrentUser error:", error);
      return null;
    }
  },

  // ============================================================
  // EVENTS
  // ============================================================

  /**
   * Get all events
   */
  async getAllEvents(): Promise<EventData[]> {
    try {
      const response = await fetch(`${BASE}/events`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok)
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      const data = await response.json();
      const events = data.events || [];
      return events.map((e: EventData & { event_image?: string }) => ({
        ...e,
        eventImage: e.eventImage || e.event_image || null,
      }));
    } catch (error) {
      console.error("adminApiService.getAllEvents error:", error);
      return [];
    }
  },

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.event || null;
    } catch (error) {
      console.error("adminApiService.getEventById error:", error);
      return null;
    }
  },

  /**
   * Create a new event (admin only)
   */
  async createEvent(payload: CreateEventPayload): Promise<EventData | null> {
    try {
      let body: FormData | string;
      let headers = adminHeaders();

      if (payload.eventImage) {
        const form = new FormData();
        form.append("name", payload.name);
        form.append("description", payload.description);
        form.append("location", payload.location);
        form.append("startDate", payload.startDate);
        form.append("endDate", payload.endDate);
        if (payload.eventType) form.append("eventType", payload.eventType);
        if (payload.details) form.append("details", payload.details);
        if (payload.rewards) form.append("rewards", payload.rewards);
        // File should be last
        form.append("eventImage", payload.eventImage);
        body = form;
      } else {
        headers = adminHeaders({ "Content-Type": "application/json" });
        const { eventImage: _img, ...rest } = payload;
        body = JSON.stringify(rest);
      }

      const response = await fetch(`${BASE}/events`, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.message || `Failed to create event: ${response.statusText}`,
        );
      }
      const data = await response.json();
      return data.event || null;
    } catch (error) {
      console.error("adminApiService.createEvent error:", error);
      throw error;
    }
  },

  /**
   * Update an event (admin only)
   */
  async updateEvent(
    eventId: string,
    payload: Partial<CreateEventPayload>,
  ): Promise<EventData | null> {
    try {
      let body: FormData | string;
      let headers = adminHeaders();

      if (payload.eventImage) {
        const form = new FormData();
        if (payload.name) form.append("name", payload.name);
        if (payload.description)
          form.append("description", payload.description);
        if (payload.location) form.append("location", payload.location);
        if (payload.startDate) form.append("startDate", payload.startDate);
        if (payload.endDate) form.append("endDate", payload.endDate);
        if (payload.eventType) form.append("eventType", payload.eventType);
        if (payload.details) form.append("details", payload.details);
        if (payload.rewards) form.append("rewards", payload.rewards);
        // File should be last
        form.append("eventImage", payload.eventImage);
        body = form;
      } else {
        headers = adminHeaders({ "Content-Type": "application/json" });
        const { eventImage: _img, ...rest } = payload;
        body = JSON.stringify(rest);
      }

      const response = await fetch(`${BASE}/events/${eventId}`, {
        method: "PUT",
        headers,
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.message || `Failed to update event: ${response.statusText}`,
        );
      }
      const data = await response.json();
      return data.event || null;
    } catch (error) {
      console.error("adminApiService.updateEvent error:", error);
      throw error;
    }
  },

  /**
   * Delete an event (admin only)
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error("adminApiService.deleteEvent error:", error);
      return false;
    }
  },

  // ============================================================
  // USERS
  // ============================================================

  /**
   * Get all user profiles (admin endpoint)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await fetch(`${BASE}/users`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok)
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("adminApiService.getAllUsers error:", error);
      return [];
    }
  },

  /**
   * Create a new user (admin/public endpoint)
   */
  async createUser(payload: any): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.message || `Failed to create user: ${response.statusText}`,
        );
      }
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("adminApiService.createUser error:", error);
      throw error;
    }
  },

  /**
   * Get top N users leaderboard
   */
  async getTopLeaderboard(limit = 999): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(
        `${BASE}/users/leaderboard/top?limit=${limit}`,
        {
          method: "GET",
          headers: adminHeaders(),
        },
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("adminApiService.getTopLeaderboard error:", error);
      return [];
    }
  },

  /**
   * Get full user profile with stats (admin only)
   */
  async getFullUserProfile(userId: string): Promise<FullUserProfile | null> {
    try {
      const response = await fetch(`${BASE}/users/full-profile/${userId}`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        ...data,
        eventsJoinedCount: data.eventsJoined,
        groupsJoinedCount: data.groupsJoined,
      };
    } catch (error) {
      console.error(`adminApiService.getFullUserProfile(${userId}) error:`, error);
      return null;
    }
  },

  // ============================================================
  // EVENT LOGS
  // ============================================================

  /**
   * Get event logs for a specific event
   */
  async getLogsByEvent(eventId: string): Promise<EventLog[]> {
    try {
      const response = await fetch(`${BASE}/event-logs/event/${eventId}`, {
        method: "GET",
        headers: adminHeaders(),
      });
      if (!response.ok) return [];
      const data = await response.json();
      // The endpoint may return { eventLogs: [...] } or { logs: [...] } or an array
      return data.eventLogs || data.logs || (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`adminApiService.getLogsByEvent(${eventId}) error:`, error);
      return [];
    }
  },

  /**
   * Get all event logs by fetching from all events (admin aggregation)
   */
  async getAllEventLogs(): Promise<EventLog[]> {
    try {
      const events = await adminApiService.getAllEvents();
      const results = await Promise.allSettled(
        events.map((e) => adminApiService.getLogsByEvent(e.eventId)),
      );
      return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    } catch (error) {
      console.error("adminApiService.getAllEventLogs error:", error);
      return [];
    }
  },

  // ============================================================
  // PLATFORM STATS
  // ============================================================

  /**
   * Aggregate platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const [users, events, leaderboard] = await Promise.all([
        adminApiService.getAllUsers(),
        adminApiService.getAllEvents(),
        adminApiService.getTopLeaderboard(999),
      ]);

      const now = new Date();
      const activeEvents = events.filter((e) => new Date(e.startDate) >= now).length;
      const totalHoursLogged = leaderboard.reduce(
        (sum, e) => sum + (e.totalHours || 0),
        0,
      );
      const totalWasteCollected = leaderboard.reduce(
        (sum, e) => sum + (e.garbageWeightCollected || 0),
        0,
      );

      return {
        totalUsers: users.length,
        totalEvents: events.length,
        activeEvents,
        totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
        totalWasteCollected: Math.round(totalWasteCollected * 10) / 10,
        totalPoints: 0,
        completedSessions: leaderboard.length,
      };
    } catch (error) {
      console.error("adminApiService.getPlatformStats error:", error);
      return {
        totalUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        totalHoursLogged: 0,
        totalWasteCollected: 0,
        totalPoints: 0,
        completedSessions: 0,
      };
    }
  },
};
