/**
 * orgApiService.ts
 * API calls for Organization management and dashboard.
 * Uses native fetch() with JWT bearer token auth.
 */

import { ENV } from "../config/env";
import { getToken, getAdminToken } from "../utils/tokenUtils";
import type { OrganizationDashboard, OrganizationProfile } from "../types/api.types";
import bcrypt from "bcryptjs";

const FRONTEND_SALT = "$2a$10$Xxxxxxxxxxxxxxxxxxxxxx";

const BASE = ENV.API_BASE_URL;

const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = getAdminToken() || getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const orgApiService = {
  /**
   * Create a new organization (registration)
   */
  async createOrganization(payload: OrganizationProfile): Promise<any> {
    try {
      // Hash password before sending
      const securePayload = { 
        ...payload,
        password: bcrypt.hashSync(payload.password, FRONTEND_SALT)
      };

      const response = await fetch(`${BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(securePayload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Backend error response:", err);
        const msg = err.message || err.msg || err.error || (Array.isArray(err.errors) ? err.errors.map((e: any) => e.msg).join(", ") : null);
        throw new Error(msg || "Failed to create organization");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.createOrganization error:", error);
      throw error;
    }
  },

  /**
   * Get all organizations (Admin only)
   */
  async getAllOrganizations(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE}/organizations`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch organizations");
      }
      const data = await response.json();
      return data.organizations || [];
    } catch (error) {
      console.error("orgApiService.getAllOrganizations error:", error);
      return [];
    }
  },

  /**
   * Update organization (Admin only - for approval/rejection)
   */
  async updateOrganization(orgId: string, payload: any): Promise<any> {
    try {
      const response = await fetch(`${BASE}/organizations/${orgId}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update organization");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.updateOrganization error:", error);
      throw error;
    }
  },

  /**
   * Get organization dashboard data
   */
  async getDashboard(): Promise<OrganizationDashboard | null> {
    try {
      const response = await fetch(`${BASE}/organization/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("orgApiService.getDashboard error:", error);
      return null;
    }
  },

  /**
   * Bulk Check-In users for an event
   */
  async bulkCheckIn(payload: {
    eventId: string;
    checkInTime: string;
    hoursEnrolled: number | string;
    users: string[];
  }): Promise<{ message: string; checkedInCount: number }> {
    try {
      const response = await fetch(`${BASE}/bulkCheckInEvent`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Bulk check-in failed");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.bulkCheckIn error:", error);
      throw error;
    }
  },

  /**
   * Bulk Check-Out users for an event
   */
  async bulkCheckOut(payload: {
    checkOutTime: string;
    garbageWeight: number | string;
    garbageType: string;
    eventLocation?: string;
    users: string[];
    eventId?: string;
    wasteImage?: File;
  }): Promise<{ message: string; updatedCount: number; totalHours: number }> {
    try {
      const formData = new FormData();
      formData.append("checkOutTime", payload.checkOutTime);
      formData.append("garbageWeight", String(payload.garbageWeight));
      formData.append("garbageType", payload.garbageType);
      if (payload.eventLocation) formData.append("eventLocation", payload.eventLocation);
      if (payload.eventId) formData.append("eventId", payload.eventId);
      
      payload.users.forEach((userId) => {
        formData.append("users[]", userId);
      });

      if (payload.wasteImage) {
        formData.append("wasteImage", payload.wasteImage);
      }

      const response = await fetch(`${BASE}/bulkCheckOutEvent`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Bulk check-out failed");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.bulkCheckOut error:", error);
      throw error;
    }
  },

  /**
   * Create a new event (Organization)
   */
  async createEvent(payload: any): Promise<any> {
    try {
      let body: FormData | string;
      let headers = getAuthHeaders();

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
        headers = getAuthHeaders({ "Content-Type": "application/json" });
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
      const event = data.event || null;
      if (event) {
        const img = event.eventImage || event.event_image || null;
        event.eventImage = img && img !== "" ? img : null;
      }
      return event;
    } catch (error) {
      console.error("orgApiService.createEvent error:", error);
      throw error;
    }
  },

  /**
   * Get current organization's profile (used for session rehydration on page refresh).
   * Hits the /organization/dashboard endpoint and extracts the profile object,
   * mapping it to a shape compatible with UserProfile so AuthContext can set currentUser.
   */
  async getOrgProfile(): Promise<{ id: string; name: string; email: string; role: string; createdAt: string; updatedAt: string } | null> {
    try {
      const response = await fetch(`${BASE}/organization/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const profile = data.profile;
      if (!profile) return null;
      // Map org profile fields to the UserProfile shape expected by AuthContext
      return {
        id: profile.orgId || profile.id || "",
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "organization",
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: profile.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error("orgApiService.getOrgProfile error:", error);
      return null;
    }
  },

  /**
   * Create an event request
   */
  async createEventRequest(payload: any): Promise<any> {
    try {
      const response = await fetch(`${BASE}/event-requests`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create event request");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.createEventRequest error:", error);
      throw error;
    }
  },

  /**
   * Get my event requests
   */
  async getMyEventRequests(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE}/event-requests/my`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch event requests");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.getMyEventRequests error:", error);
      return [];
    }
  },

  /**
   * Update event request status
   */
  async updateEventRequestStatus(requestId: string, status: "approved" | "rejected"): Promise<any> {
    try {
      const response = await fetch(`${BASE}/event-requests/${requestId}/status`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update event request status");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.updateEventRequestStatus error:", error);
      throw error;
    }
  },
};
