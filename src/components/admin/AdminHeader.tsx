/**
 * AdminHeader.tsx
 * Top header bar with breadcrumb, search, and user profile.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, Bell } from "lucide-react";
import { useAdminAuthContext } from "../../context/AdminAuthContext";
import { toast } from "sonner";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users":     "Users",
  "/admin/events":    "Events",
  "/admin/logs":      "Activity Logs",
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const { currentUser, logout } = useAdminAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;
  // Find the matching page label
  const currentPage = Object.entries(PAGE_LABELS).find(([key]) =>
    pathname.endsWith(key)
  )?.[1] || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Toggle menu"
          id="admin-menu-toggle"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 font-medium">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-bold">{currentPage}</span>
        </div>
      </div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 relative">
          <Bell size={18} />
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-none">{currentUser?.name || "Admin"}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{currentUser?.role || "admin"}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white cursor-pointer shrink-0"
            style={{ background: "#08351e" }}
            title={currentUser?.name}
          >
            {initials}
          </div>
        </div>

        {/* Logout (desktop) */}
        <button
          onClick={handleLogout}
          className="ml-1 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
          title="Sign out"
          id="admin-logout-btn"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};
