/**
 * AdminSidebar.tsx
 * Professional, elegant navigation sidebar with refined solid theme colors.
 * No gradients - using pure solid colors only.
 * Palette: #86B537 (green) • #509CD1 (sky) • #108ACB (blue)
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
import { useAdminAuthContext } from "../../../context/AdminAuthContext";
import logo from "../../../assets/publicHygineCouncil.png";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  bgColor: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    iconColor: "#509CD1",
    bgColor: "#E8F2FA",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
    iconColor: "#86B537",
    bgColor: "#F0F7E4",
  },
  {
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
    iconColor: "#108ACB",
    bgColor: "#E8F2FA",
  },
  {
    label: "Activity Logs",
    path: "/admin/logs",
    icon: ClipboardList,
    iconColor: "#86B537",
    bgColor: "#F0F7E4",
  },
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
          className="fixed inset-0 z-40 bg-[#1A2A3A]/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col
          transition-transform duration-300 ease-in-out shadow-xl
          lg:translate-x-0 lg:relative lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E8EDF2",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center px-5 py-5 shrink-0 border-b border-[#E8EDF2] relative">
          <div className="rounded-lg p-1.5" style={{ background: "#F5F7FA" }}>
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-9 md:h-12 lg:h-14 object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[#8A9AA8] hover:text-[#1A2A3A] transition-colors absolute right-5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Menu Label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold tracking-wider text-[#8A9AA8] uppercase">
            Main Menu
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive ? "font-medium" : "hover:bg-[#F8F9FB]"
                  }`
                }
                style={({ isActive }) => {
                  const baseStyle: React.CSSProperties = {
                    borderLeft: isActive
                      ? `3px solid ${item.iconColor}`
                      : "3px solid transparent",
                    paddingLeft: "11px",
                  };
                  if (isActive) {
                    baseStyle.background = item.bgColor;
                  }
                  return baseStyle;
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      className="shrink-0"
                      // style={{
                      //   color: isActive ? item.iconColor : "#A0AAB5",
                      // }}
                    />
                    <span
                      className={`text-[13px] flex-1 transition-colors ${
                        isActive
                          ? "text-[#1A2A3A] font-medium"
                          : "text-[#6B7A88]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="shrink-0 px-3 py-4 border-t border-[#E8EDF2]">
          {/* User Profile Card */}
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-3"
            style={{ background: "#F5F7FA" }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white text-sm font-semibold"
              style={{ background: "#86B537" }}
            >
              {currentUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#1A2A3A] text-[12px] font-medium truncate">
                {currentUser?.name || "Admin User"}
              </p>
              <p className="text-[10px] truncate text-[#8A9AA8]">
                {currentUser?.email || "admin@phc.gov.sg"}
              </p>
            </div>
          </div>

          {/* Logout Button - Changed from pink to blue */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-[#6B7A88] hover:text-[#108ACB] hover:bg-[#E8F2FA] text-[13px] font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
