/**
 * AdminApp.tsx
 * Root of the Admin-facing application.
 * Mounts its own AdminAuthProvider so the admin session is
 * completely isolated from the user AuthContext.
 *
 * Public:   /admin/login
 * Protected: /admin/dashboard, /admin/users, /admin/events, /admin/logs
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "../../context/AdminAuthContext";
import { AdminProtectedRoute } from "../../components/sections/auth/AdminProtectedRoute";
import { AdminLayout } from "../../components/sections/admin/AdminLayout";
// import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UsersPage } from "./pages/UsersPage";
import { EventsPage } from "./pages/EventsPage";
import { EventLogsPage } from "./pages/EventLogsPage";
import { NotFoundPage } from "../../pages/NotFoundPage";

export const AdminApp: React.FC = () => (
  <AdminAuthProvider>
    <Routes>
      {/* ── Public: admin login (no auth guard) ───────────────────────── */}
      {/* <Route path="login" element={<AdminLoginPage />} /> */}

      {/* ── Protected: all other admin pages ─────────────────────────── */}
      <Route
        path="*"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                {/* Default: redirect /admin → /admin/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="logs" element={<EventLogsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
    </Routes>
  </AdminAuthProvider>
);

