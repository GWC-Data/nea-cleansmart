/**
 * admin.types.ts
 * Admin-specific TypeScript types for the NEA CleanTrack Admin Panel.
 */
import type React from "react";

// ─── API Payload Types ────────────────────────────────────────────────────────

export interface CreateEventPayload {
  name: string;
  description: string;
  details?: string;
  location: string;
  startDate: string;
  endDate: string;
  time?: string;
  rewards?: string;
  eventType?: "public" | "private";
  eventImage?: File;
}

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  totalHoursLogged: number;
  totalWasteCollected: number;
  totalPoints: number;
  completedSessions: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type AdminNavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

// ─── Log Status ───────────────────────────────────────────────────────────────

export type LogStatus = "active" | "completed";

// ─── Auth State in Admin Context ─────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
}
