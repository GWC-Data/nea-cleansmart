/**
 * AdminHeader.tsx
 * Professional top header bar with breadcrumb, notifications, and user profile.
 * Clean and elegant design without search bar.
 * Theme colors: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
 */

import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, UserCheck, ChevronRight } from "lucide-react";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const PAGE_LABELS: Record<string, { label: string; accent: string }> = {
  "/admin/dashboard": { label: "Dashboard", accent: "#509CD1" },
  "/admin/users": { label: "Users", accent: "#86B537" },
  "/admin/events": { label: "Events", accent: "#108ACB" },
  "/admin/logs": { label: "Activity Logs", accent: "#86B537" },
  "/admin/requests": { label: "Organization Requests", accent: "#108ACB" },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const currentPageInfo = Object.entries(PAGE_LABELS).find(([key]) =>
    pathname.endsWith(key),
  )?.[1] || { label: "Admin", accent: "#509CD1" };

  return (
    <header
      className="sticky top-0 z-40 bg-white shrink-0"
      style={{
        borderBottom: "1px solid #E8EDF2",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left Section: Menu Toggle + Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors text-[#6B7A88] hover:text-[#1A2A3A]"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2">
            <span className="text-sm text-[#8A9AA8] font-medium">Admin</span>
            <ChevronRight size={14} className="text-[#C5CDD5]" />
            <span
              className="text-sm font-semibold"
              style={{ color: currentPageInfo.accent }}
            >
              {currentPageInfo.label}
            </span>
          </nav>
        </div>

        {/* Right Section: Notifications */}
        <div className="flex items-center gap-2">
          {/* Organization Requests Link */}
          <Link
            to="/admin/requests"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-[#6B7A88] hover:text-[#108ACB]"
            aria-label="Organization Requests"
          >
            <UserCheck size={18} />
            <span className="text-sm font-medium">Requests</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
