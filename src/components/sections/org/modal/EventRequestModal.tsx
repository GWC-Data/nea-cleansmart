import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { orgApiService } from "../../../../services/orgApiService";

interface EventRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventRequestModal: React.FC<EventRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    organizationEmail: "",
    date: "",
    time: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orgApiService.createEventRequest(formData);
      toast.success("Event request submitted successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit event request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EDF2] bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1A2A3A]">Request to Create Event</h2>
            <p className="text-xs text-[#8A9AA8] mt-0.5">
              Submit your event details for admin approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F7FA] rounded-full transition-colors"
          >
            <X size={18} className="text-[#6B7A88]" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <form id="event-request-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#6B7A88] uppercase tracking-wider mb-1.5">
                Event Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Beach Clean-Up"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#509CD1] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#6B7A88] uppercase tracking-wider mb-1.5">
                Organization Email Address *
              </label>
              <input
                required
                type="email"
                placeholder="email@example.com"
                value={formData.organizationEmail}
                onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#509CD1] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#6B7A88] uppercase tracking-wider mb-1.5">
                  Date *
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#509CD1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#6B7A88] uppercase tracking-wider mb-1.5">
                  Time *
                </label>
                <input
                  required
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#509CD1] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#6B7A88] uppercase tracking-wider mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Brief description of the event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8EDF2] text-sm focus:outline-none focus:border-[#509CD1] transition-colors resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-[#E8EDF2] bg-[#FBFBFC] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#6B7A88] bg-white border border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-request-form"
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#86B537] hover:bg-[#7aa632] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};
