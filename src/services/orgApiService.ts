/**
 * orgApiService.ts
 * API calls for Organization management and dashboard.
 * Uses native fetch() with JWT bearer token auth.
 */

import { ENV } from "../config/env";
import { getToken } from "../utils/tokenUtils";
import type { OrganizationDashboard } from "../types/api.types";

const BASE = ENV.API_BASE_URL;

const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const orgApiService = {
  /**
   * Create a new organization (registration)
   */
  async createOrganization(payload: any): Promise<any> {
    try {
      const response = await fetch(`${BASE}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create organization");
      }
      return await response.json();
    } catch (error) {
      console.error("orgApiService.createOrganization error:", error);
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
};
