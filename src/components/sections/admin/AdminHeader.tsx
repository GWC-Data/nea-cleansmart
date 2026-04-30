/**
 * AdminHeader.tsx
 * Professional top header bar with breadcrumb, notifications, and user profile.
 * Clean and elegant design without search bar.
 * Theme colors: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
 */

import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, Bell, ChevronRight } from "lucide-react";
import { orgApiService } from "../../../services/orgApiService";

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
  const [pendingCount, setPendingCount] = React.useState(0);
  const location = useLocation();
  const pathname = location.pathname;

  const fetchPendingCount = React.useCallback(async () => {
    try {
      const orgs = await orgApiService.getAllOrganizations();
      const pending = orgs.filter((o: any) => o.status === 'pending').length;
      setPendingCount(pending);
    } catch (err) {
      console.error("Failed to fetch pending org count:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingCount();
    // Refresh count when location changes (in case an approval happened)
    const interval = setInterval(fetchPendingCount, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchPendingCount, pathname]);

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
          <Link
            to="/admin/requests"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-[#6B7A88] hover:text-[#108ACB] relative group"
            aria-label="Organization Requests"
          >
            <div className="relative">
              <Bell size={20} className="group-hover:animate-shake" />
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </div>
            {/* <span className="text-sm font-medium hidden sm:inline">Requests</span> */}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
