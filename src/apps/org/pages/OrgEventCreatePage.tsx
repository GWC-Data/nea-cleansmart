import React from "react";
import { useNavigate } from "react-router-dom";
import { EventFormPage } from "../../../components/sections/admin/modal/EventFormPage";
import { orgApiService } from "../../../services/orgApiService";
import { toast } from "sonner";
import logo from "../../../assets/publicHygineCouncil.png";
import { ArrowLeft } from "lucide-react";

export const OrgEventCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleEventSubmit = async (values: any, imageFile: File | null) => {
    const payload = {
      ...values,
      ...(imageFile ? { eventImage: imageFile } : {}),
    };
    await orgApiService.createEvent(payload);
    toast.success("Event submitted successfully and is pending approval.");
    navigate("/org/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">
      {/* Navigation / Header */}
      {/* Comment: White page navigation bar matching EventDetailPage style, displaying the back arrow button to return to dashboard. */}
      <header className="bg-white px-5 sm:px-8 lg:px-12 py-4 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/org/dashboard")}
            className="cursor-pointer flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="flex items-center justify-end gap-4">
          <img
            src={logo}
            onClick={() => navigate("/org/dashboard")}
            alt="Public Hygiene Council"
            className="h-10 w-auto object-contain cursor-pointer"
          />
        </div>
      </header>

      {/* Content Area */}
      {/* Comment: Content container width set to max-w-[1400px] matching dashboard screen width configurations. */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 pt-10 pb-12 flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight mb-2">
            Create New Event
          </h2>
          <div className="flex-1 overflow-hidden flex flex-col">
            <EventFormPage
              isOpen={true}
              onClose={() => navigate("/org/dashboard")}
              onSuccess={() => navigate("/org/dashboard")}
              showEventTypeToggle={true}
              onSubmitOverride={handleEventSubmit}
              isPage={true}
              isOrgFlow={true} /* Custom prop to restrict dates to start date and duration dropdown in organization flow */
            />
          </div>
        </div>
      </main>

      {/* Global Footer */}
      {/* Comment: Page footer matching dashboard and detail page footer design guidelines. */}
      <footer className="max-w-[1400px] mx-auto w-full px-6 py-5 border-t border-gray-100 bg-white lg:bg-transparent mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img
              src={logo}
              onClick={() => navigate("/org/dashboard")}
              alt="Public Hygiene Council"
              className="h-8 lg:h-10 w-auto object-contain cursor-pointer"
            />
          </div>
          <p className="text-xs font-semibold text-gray-400 text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
