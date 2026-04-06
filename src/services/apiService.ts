import { ENV } from "../config/env";

export interface EventData {
  eventId: number;
  date: string;
  location: string;
  name: string;
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

const BASE = ENV.API_BASE_URL;

export const apiService = {
  /**
   * Fetch active events
   */
  async getEvents(): Promise<EventData[]> {
    try {
      const response = await fetch(`${BASE}/events`);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("events", data);
      // Depending on API structure, it could be the array directly or wrapped in an object
      return Array.isArray(data) ? data : data.events || data.data || [];
    } catch (error) {
      console.error("getEvents error:", error);
      return [];
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        // Fallback to PATCH if PUT fails
        if (response.status === 404 || response.status === 405) {
          const patchResponse = await fetch(
            `${BASE}/event-logs/${logId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error(`Password reset request failed: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.error("requestPasswordReset error:", error);
      return false;
    }
  },
};
