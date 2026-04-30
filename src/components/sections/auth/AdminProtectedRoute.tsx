/**
 * AdminProtectedRoute.tsx
 * Guards all /admin/* sub-routes (except /admin/login).
 * Reads from AdminAuthContext — completely independent of the user ProtectedRoute.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuthContext } from "../../../context/AdminAuthContext";
import { Leaf } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const { currentUser, isLoading } = useAdminAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "#f0f4f8" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
          style={{ background: "#0f4772" }}
        >
          <Leaf size={20} className="text-white animate-pulse" />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#0f4772" }}>
          Checking admin access…
        </p>
      </div>
    );
  }

  // No admin session — save the intended path and redirect to admin login
  if (!currentUser || currentUser.role !== "admin") {
    sessionStorage.setItem("admin_redirect_after_login", location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
