import React from "react";
import { useNavigate } from "react-router-dom";
import { EventFormPage } from "../../../components/sections/admin/modal/EventFormPage";
import { orgApiService } from "../../../services/orgApiService";
import { toast } from "sonner";
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
    <div className="min-h-screen flex flex-col sm:p-2 md:p-10">
      {/* Navigation / Header */}
      <div className="px-6 py-4 border-b border-[#E8EDF2] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/org/dashboard")}
            className="cursor-pointer p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#8A9AA8] hover:text-[#1A2A3A]"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight">
            Create New Event
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <EventFormPage
          isOpen={true}
          onClose={() => navigate("/org/dashboard")}
          onSuccess={() => navigate("/org/dashboard")}
          showEventTypeToggle={true}
          onSubmitOverride={handleEventSubmit}
          isPage={true}
        />
      </div>
    </div>
  );
};
