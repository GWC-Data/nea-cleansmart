/**
 * AdminSidebar.tsx
 * Dark blue navigation sidebar for the Admin Panel.
 */

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  LogOut,
  X,
} from "lucide-react";
import { useAdminAuthContext } from "../../context/AdminAuthContext";
import { toast } from "sonner";
import logo from "../../assets/publicHygineCouncil.png";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Events", path: "/admin/events", icon: CalendarDays },
  { label: "Activity Logs", path: "/admin/logs", icon: ClipboardList },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { logout, currentUser } = useAdminAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "#0f4772",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center px-5 py-5 shrink-0">
          <div className="flex items-center">
            {/* add the publicHygineCouncil image present in the users page*/}
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-10 md:h-12 object-contain"
            />
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                    isActive
                      ? "bg-white/10 border-l-[3px] pl-2.5"
                      : "hover:bg-white/5 border-l-[3px] border-transparent pl-2.5"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { borderLeftColor: "#96c93d" } : {}
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-white/50 group-hover:text-white/75"
                      }`}
                    />
                    <span
                      className={`text-sm tracking-tight transition-colors ${
                        isActive
                          ? "text-white font-bold"
                          : "text-white/70 font-medium group-hover:text-white/90"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: "#96c93d" }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer — User + Logout */}
        <div
          className="shrink-0 px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* User info */}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-white"
              style={{ background: "#08351e" }}
            >
              {currentUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-bold truncate leading-none">
                {currentUser?.name || "Admin"}
              </p>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {currentUser?.email || ""}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
