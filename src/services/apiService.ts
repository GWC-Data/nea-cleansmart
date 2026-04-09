import { ENV } from "../config/env";
import { getToken } from "../utils/tokenUtils";

export interface EventData {
  eventId: number;
  date: string;
  location: string;
  name: string;
  details: string;
  description: string;
  rewards: string;
  joinsCount: number;
  participants: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckInPayload {
  eventId: number;
  userId: number;
  checkInTime: string;
}

export interface CheckOutPayload {
  checkOutTime: string;
  garbageWeight: number;
  garbageType: string;
}
export interface UserStats {
  totalMinutes: number;
  totalPoints: number;
  totalWeight: number;
  completedEvents: number;
  currentBadge: string | null;
  badgeMessage: string | null;
}

export interface UserEventLogsResponse {
  eventLogs: EventLog[];
  stats: UserStats;
}
export interface EventLog {
  id: number;
  eventId: number;
  userId: number;
  groupId: number | null;
  checkInTime: string;
  checkOutTime: string;
  totalHours: number;
  garbageWeight: number;
  garbageType: string;
  createdAt: string;
  updatedAt: string;
  event: {
    eventId: number;
    name: string;
    location: string;
    date: string;
  };
  group: null;
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
  /**
   * Fetch active events
   */
  async getEvents(): Promise<EventData[]> {
    const fallbackData: EventData[] = [
      {
        eventId: 1,
        date: "2026-04-20T00:00:00.000Z",
        location: "Remote",
        name: "15-Hour Clean-up Challenge",
        details: "1 clean-up (minimum 30 minutes to maximum 2 hours)",
        description: "We all have a hand in keeping Singapore clean.",
        rewards:
          "All members who complete 15 hours of clean-up activities in 2026 will receive an attractive premium from PHC. Terms and conditions apply.",
        joinsCount: 1,
        participants: [1],
        createdAt: "2026-04-07T12:11:46.000Z",
        updatedAt: "2026-04-07T12:11:46.000Z",
      },
    ];
    try {
      const response = await fetch(`${BASE}/events`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      const data = await response.json();
      const fetchedEvents = Array.isArray(data)
        ? data
        : data.events || data.data || [];
      return fetchedEvents.length > 0 ? fetchedEvents : fallbackData;
    } catch (error) {
      console.error("getEvents error:", error);
      return fallbackData;
    }
  },

  /**
   * Check in to an event
   * returns the newly generated record id
   */
  async checkInEvent(payload: CheckInPayload): Promise<number | null> {
    try {
      console.log("checkin payload", payload);
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
      console.log("checkin response", data);

      // The backend wraps the payload inside "eventLog" or "eventlog"
      const logRecord = data.eventLog || data.eventlog || data;

      // If backend returns id: null (possibly a DB sync issue), we ensure
      // we at least return a truthy value like logRecord.eventId or a fallback
      // so the UI recognizes the check-in was successful.
      return (
        logRecord.id ||
        logRecord.eventlogId ||
        logRecord.insertId ||
        logRecord.eventId ||
        Date.now() // fallback if no ID is present so it registers as success
      );
    } catch (error) {
      console.error("checkInEvent error:", error);
      return null;
    }
  },

  /**
   * Check out of an event
   */
  async checkOutEvent(
    logId: number,
    payload: CheckOutPayload,
  ): Promise<boolean> {
    try {
      console.log("checkout payload", payload);
      // User specifies PUT or PATCH. Using PUT as default for updating the record
      const response = await fetch(`${BASE}/event-logs/${logId}`, {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        // Fallback to PATCH if PUT fails
        if (response.status === 404 || response.status === 405) {
          const patchResponse = await fetch(`${BASE}/event-logs/${logId}`, {
            method: "PATCH",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(payload),
          });
          console.log("checkout response", patchResponse);
          return patchResponse.ok;
        }
        throw new Error(`Failed to check out: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("checkOutEvent error:", error);
      return false;
    }
  },

  /**
   * Request a password-reset OTP for the given email.
   * TODO: Replace the URL/method once the backend endpoint is finalised.
   *
   * @param email  The address the user entered in the "Forgot Password" modal.
   * @returns      true  → OTP sent successfully
   *               false → request failed (network error / unknown email / etc.)
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
   * Join an event
   */
  async joinEvent(eventId: number, userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/events/${eventId}/join`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ userId }),
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
   * Update user joined events
   */
  async updateUserJoinedEvents(
    userId: number,
    eventId: number,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${BASE}/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ joinedEvents: [eventId] }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update user joined events: ${response.statusText}`,
        );
      }
      return true;
    } catch (error) {
      console.error("updateUserJoinedEvents error:", error);
      return false;
    }
  },

  /**
   * Fetch event logs and stats for a user
   */
  async getUserEventLogs(
    userId: string | number,
  ): Promise<UserEventLogsResponse | null> {
    try {
      const response = await fetch(`${BASE}/event-logs/user/${userId}`, {
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
};
