import { ENV } from "../config/env";
import { getToken } from "../utils/tokenUtils";
import bcrypt from "bcryptjs";

// We use a fixed salt so the frontend always generates the exact same hash for the same password.
// Be aware that frontend hashing is not a replacement for HTTPS.
const FRONTEND_SALT = "$2a$10$Xxxxxxxxxxxxxxxxxxxxxx";

/**
 * Event Data Interface
 */
export interface EventData {
  eventId: string;
  date: string;
  location: string;
  name: string;
  details: string;
  description: string;
  rewards: string;
  joinsCount: number;
  participants: string[];
  eventImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Check-in payload - sent to backend
 * userId and other user data are extracted from JWT token on backend
 */
export interface CheckInPayload {
  eventId: string;
  checkInTime?: string;
  groupId?: number;
  garbageWeight?: number;
  garbageType?: string;
  hoursEnrolled?: string;
}

/**
 * Check-out payload - sent to backend with event log ID
 * Data only includes check-out time and waste info
 */
export interface CheckOutPayload {
  checkOutTime: string;
  garbageWeight: number;
  garbageType: string;
  eventLocation?: string;
  wasteImage?: File;
}

/**
 * User Stats returned from /dashboard endpoint
 */
export interface UserStats {
  totalPoints: number;
  co2Collected: number;
  totalMinutesLogged: number;
  totalWeight: number;
  todayHours?: number;
}

/**
 * A single joined event entry from /dashboard eventsJoined
 */
export interface DashboardEvent {
  eventId: string;
  eventName: string;
  location: string;
  eventDate: string;
  joinedCount: number;
  eventImage: string | null;
}

/**
 * Full /dashboard response shape
 */
export interface DashboardData {
  message: string;
  profile: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  stats: UserStats;
  eventsJoined: DashboardEvent[];
}

/**
 * Event Log with associations
 */
export interface EventLog {
  id: string;
  eventId: string;
  userId: string;
  groupId: number | null;
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
  garbageWeight: number;
  garbageType: string;
  wasteImage?: string;
  createdAt: string;
  updatedAt: string;
  event: {
    eventId: string;
    name: string;
    location: string;
    date: string;
  };
  group: {
    groupId: string;
    groupName: string;
  } | null;
}

/**
 * User Profile returned from backend
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  gender?: string;
  joinedEvents?: string[];
  group?: {
    groupId: string;
    groupName: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * User Event Logs Response with stats
 */
export interface UserEventLogsResponse {
  eventLogs: EventLog[];
  stats: UserStats;
}

/**
 * Rewards Summary returned from backend
 */
export interface RewardsSummary {
  user: {
    id: string;
    name: string;
    email: string;
  };
  rewards: {
    totalHours: string;
    totalMinutes: number;
    totalPoints: number;
    currentBadge: string | null;
    currentBadgeMessage: string | null;
    nextBadge?: {
      badge: string;
      hoursNeeded: string;
    } | null;
    badgeHistory: Array<{
      badge: string;
      hours: number;
      earnedAt: string;
    }>;
    completedEvents: number;
  };
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  totalHours: number;
  garbageWeightCollected: number;
  checkInTime: string;
  checkOutTime: string;
  eventName: string;
  eventDate: string;
}

export interface EventLeaderboard {
  message: string;
  eventDetails: {
    eventId: string;
    eventName: string;
    eventDate: string;
    location: string;
    totalParticipants: number;
  };
  leaderboard: LeaderboardEntry[];
}

const BASE = ENV.API_BASE_URL;

const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = getToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  // ============================================================
  // EVENTS ENDPOINTS
  // ============================================================

  /**
   * Get all events
   * All users in a session can see available events
   * @returns Array of available events
   */
  async getEvents(): Promise<EventData[]> {
    try {
      const response = await fetch(`${BASE}/events`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      const data = await response.json();
      const events = data.events || [];
      return events.map((e: any) => ({
        ...e,
        eventImage: e.eventImage || e.event_image || null,
      }));
    } catch (error) {
      console.error("getEvents error:", error);
      return [];
    }
  },

  /**
   * Get upcoming events
   * @returns Array of upcoming events ordered by date
   */
  async getUpcomingEvents(): Promise<EventData[]> {
    try {
      const response = await fetch(`${BASE}/events/upcoming`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch upcoming events: ${response.statusText}`,
        );
      }
      const data = await response.json();
      const events = data.events || [];
      return events.map((e: any) => ({
        ...e,
        eventImage: e.eventImage || e.event_image || null,
      }));
    } catch (error) {
      console.error("getUpcomingEvents error:", error);
      return [];
    }
  },

  /**
   * Get event by ID
   * @param eventId The event ID
   * @returns Event details with participants
   */
  async getEventById(eventId: string): Promise<EventData | null> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch event ${eventId}: ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (data.event) {
        data.event.eventImage =
          data.event.eventImage || data.event.event_image || null;
      }
      return data.event || null;
    } catch (error) {
      console.error("getEventById error:", error);
      return null;
    }
  },

  /**
   * Join an event
   * User ID is extracted from JWT token on backend
   * @param eventId The event ID to join
   * @returns Success status
   */
  async joinEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}/join`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to join event: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("joinEvent error:", error);
      return false;
    }
  },

  /**
   * Leave an event
   * User ID is extracted from JWT token on backend
   * @param eventId The event ID to leave
   * @returns Success status
   */
  async leaveEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}/leave`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to leave event: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("leaveEvent error:", error);
      return false;
    }
  },

  /**
   * Get event participants
   * @param eventId The event ID
   * @returns List of participants
   */
  async getEventParticipants(eventId: string): Promise<any> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}/participants`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch participants: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("getEventParticipants error:", error);
      return null;
    }
  },

  /**
   * Get user's joined events
   * User ID is extracted from JWT token on backend
   * @returns Array of events the current user has joined
   */
  async getUserJoinedEvents(): Promise<any> {
    try {
      const response = await fetch(`${BASE}/events/joined`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch joined events: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("getUserJoinedEvents error:", error);
      return null;
    }
  },

  // ============================================================
  // EVENT LOGS (CHECK-IN/CHECK-OUT) ENDPOINTS
  // ============================================================

  /**
   * Get active timer for the current user
   * @returns Active timer info or null
   */
  async getTimer(): Promise<{
    checkInTime: string;
    hoursEnrolled: string;
    eventId: string;
    logId: number;
  } | null> {
    try {
      const response = await fetch(`${BASE}/timer`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch timer: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.message === "No active timer found for this user") {
        return null;
      }
      return data;
    } catch (error) {
      console.error("getTimer error:", error);
      return null;
    }
  },

  /**
   * Check in to an event
   * User ID is extracted from JWT token on backend
   * @param payload Check-in data (eventId, optional: checkInTime, groupId, garbageWeight, garbageType)
   * @returns The created event log ID or null if failed
   */
  async checkInEvent(payload: CheckInPayload): Promise<number | null> {
    try {
      const response = await fetch(`${BASE}/event-logs`, {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to check in: ${response.statusText}`);
      }
      const data = await response.json();
      const logRecord = data.eventLog || data;
      return logRecord?.id || null;
    } catch (error) {
      console.error("checkInEvent error:", error);
      return null;
    }
  },

  /**
   * Check out of an event
   * Updates the event log with check-out time and waste information
   * @param logId The event log ID
   * @param payload Check-out data (checkOutTime, garbageWeight, garbageType)
   * @returns Success status
   */
  async checkOutEvent(
    logId: number,
    payload: CheckOutPayload,
  ): Promise<boolean> {
    try {
      // Build FormData — required since backend uses multer
      const formData = new FormData();
      formData.append("checkOutTime", payload.checkOutTime);
      formData.append("garbageWeight", String(payload.garbageWeight));
      formData.append("garbageType", payload.garbageType);
      if (payload.eventLocation) {
        formData.append("eventLocation", payload.eventLocation);
      }
      if (payload.wasteImage) {
        formData.append("wasteImage", payload.wasteImage); // field name must match multer
      }

      const response = await fetch(`${BASE}/event-logs/${logId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to check out: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("checkOutEvent error:", error);
      return false;
    }
  },

  /**
   * Update event log (partial update, e.g., waste image upload)
   * @param logId The event log ID
   * @param payload Update data (any subset of fields)
   * @returns Success status
   */
  async updateEventLog(
    logId: string,
    payload: Partial<CheckOutPayload>,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/event-logs/${logId}`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to update event log: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("updateEventLog error:", error);
      return false;
    }
  },

  /**
   * Get user's event logs and stats
   * User ID is extracted from JWT token on backend
   * @returns Event logs with calculated statistics
   */
  async getUserEventLogs(): Promise<UserEventLogsResponse | null> {
    try {
      const response = await fetch(`${BASE}/event-logs/user`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user event logs: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("getUserEventLogs error:", error);
      return null;
    }
  },

  /**
   * Get user's event logs by date
   * User ID is extracted from JWT token on backend
   * @param date Date string in format YYYY-MM-DD
   * @returns Event logs for that day with stats
   */
  async getUserEventLogsByDate(date: string): Promise<any | null> {
    try {
      const response = await fetch(`${BASE}/event-logs/user/date/${date}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch event logs for date: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("getUserEventLogsByDate error:", error);
      return null;
    }
  },

  /**
   * Get user's rewards summary
   * User ID is extracted from JWT token on backend
   * @returns Rewards summary with badges and achievements
   */
  async getUserRewardsSummary(): Promise<RewardsSummary | null> {
    try {
      const response = await fetch(`${BASE}/event-logs/user/rewards`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch rewards summary: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("getUserRewardsSummary error:", error);
      return null;
    }
  },

  /**
   * Get event logs by event
   * @param eventId The event ID
   * @returns Event logs for that event with stats
   */
  async getEventLogsByEvent(eventId: string): Promise<any | null> {
    try {
      const response = await fetch(`${BASE}/event-logs/event/${eventId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch event logs for event: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("getEventLogsByEvent error:", error);
      return null;
    }
  },

  // ============================================================
  // DASHBOARD ENDPOINT
  // ============================================================

  /**
   * Get logged-in user's dashboard data
   * Returns profile, stats (points, CO2, hours, weight), and joined events
   * User ID is extracted from JWT token on backend
   */
  async getDashboard(): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${BASE}/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }
      return (await response.json()) as DashboardData;
    } catch (error) {
      console.error("getDashboard error:", error);
      return null;
    }
  },

  // ============================================================
  // USER ENDPOINTS
  // ============================================================

  /**
   * Get current user profile
   * User ID is extracted from JWT token on backend
   * @returns Current user profile information
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BASE}/users/details`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("getUserProfile error:", error);
      return null;
    }
  },

  /**
   * Update current user profile
   * User ID is extracted from JWT token on backend
   * @param data Fields to update (name, email, age, gender, groupId, etc.)
   * @returns Updated user profile
   */
  async updateUserProfile(
    data: Partial<UserProfile>,
  ): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${BASE}/users`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update user profile: ${response.statusText}`,
        );
      }
      const result = await response.json();
      return result.user || null;
    } catch (error) {
      console.error("updateUserProfile error:", error);
      return null;
    }
  },

  /**
   * Delete current user account
   * User ID is extracted from JWT token on backend
   * @returns Success status
   */
  async deleteUserAccount(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/users`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to delete user account: ${response.statusText}`,
        );
      }
      return true;
    } catch (error) {
      console.error("deleteUserAccount error:", error);
      return false;
    }
  },

  /**
   * Get user leaderboard (top performers)
   * No authentication required
   * @param limit Number of top users to fetch (default: 10)
   * @returns Array of top users with stats
   */
  async getUserLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE}/users/leaderboard/top?limit=${limit}`,
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("getUserLeaderboard error:", error);
      return [];
    }
  },

  /**
   * Get all user profiles
   * No authentication required
   * @returns Array of all user profiles
   */
  async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const response = await fetch(`${BASE}/users-profiles`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user profiles: ${response.statusText}`,
        );
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("getAllUserProfiles error:", error);
      return [];
    }
  },

  // ============================================================
  // EVENT LEADERBOARD ENDPOINTS
  // ============================================================

  /**
   * Get event leaderboard
   * @param eventId The event ID
   * @returns Event leaderboard with stats
   */
  async getEventLeaderboard(eventId: string): Promise<EventLeaderboard | null> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}/leaderboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("getEventLeaderboard error:", error);
      return null;
    }
  },

  // ============================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================

  /**
   * Request password reset OTP
   * No authentication required
   * @param email User's email address
   * @returns Success status
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error(
          `Password reset request failed: ${response.statusText}`,
        );
      }
      return true;
    } catch (error) {
      console.error("requestPasswordReset error:", error);
      return false;
    }
  },

  /**
   * Reset user password using token
   * @param token The reset token from email link
   * @param password The new password
   * @returns Success status
   */
  async resetPassword(token: string, password: string): Promise<boolean> {
    try {
      // Hash password before sending
      const hashedPassword = bcrypt.hashSync(password, FRONTEND_SALT);

      const response = await fetch(`${BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: hashedPassword }),
      });
      if (!response.ok) {
        throw new Error(`Password reset failed: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("resetPassword error:", error);
      return false;
    }
  },
};
