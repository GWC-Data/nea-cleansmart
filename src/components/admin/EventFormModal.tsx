/**
 * EventFormModal.tsx
 * Create / Edit event modal with react-hook-form + zod validation.
 * Split layout: form on left, live preview on right (desktop).
 */

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  MapPin,
  CalendarDays,
  ImageIcon,
  Loader2,
  Trophy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { adminApiService } from "../../services/adminApiService";
import type { EventData } from "../../types/apiTypes";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  details: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  date: z.string().min(1, "Date is required"),
  rewards: z.string().optional(),
});

type EventFormFields = z.infer<typeof eventSchema>;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEvent?: EventData | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingEvent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EventFormFields>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      details: "",
      location: "",
      date: "",
      rewards: "",
    },
  });

  const watchedValues = watch();

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      // Format date for datetime-local input
      const dateStr = editingEvent.date
        ? new Date(editingEvent.date).toISOString().slice(0, 16)
        : "";
      reset({
        name: editingEvent.name || "",
        description: editingEvent.description || "",
        details: editingEvent.details || "",
        location: editingEvent.location || "",
        date: dateStr,
        rewards: editingEvent.rewards || "",
      });
      setImagePreview(editingEvent.eventImage || null);
      setImageFile(null);
    } else {
      reset({
        name: "",
        description: "",
        details: "",
        location: "",
        date: "",
        rewards: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingEvent, reset, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: EventFormFields) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        ...(imageFile ? { eventImage: imageFile } : {}),
      };

      if (editingEvent) {
        await adminApiService.updateEvent(editingEvent.eventId, payload);
        toast.success("Event updated successfully!");
      } else {
        await adminApiService.createEvent(payload);
        toast.success("Event created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const previewDate = watchedValues.date
    ? new Date(watchedValues.date)
    : null;

  const formattedDate = previewDate
    ? previewDate.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const formattedMonth = previewDate
    ? previewDate.toLocaleDateString("en-SG", { month: "short" }).toUpperCase()
    : "";
  const formattedDay = previewDate
    ? previewDate.toLocaleDateString("en-SG", { day: "numeric" })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col scale-in-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {editingEvent
                ? "Update event details below"
                : "Fill in the details to create a new clean-up event"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            id="event-form-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
            {/* ── LEFT: Form ── */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              id="event-form"
              noValidate
              className="px-6 py-5 space-y-4 border-r border-gray-100"
            >
              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Event Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. East Coast Park Clean-Up"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ "--tw-ring-color": "#107acc" } as React.CSSProperties}
                  id="event-name-input"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    {...register("location")}
                    placeholder="e.g. East Coast Park, Singapore"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    id="event-location-input"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.location.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Date & Time <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="datetime-local"
                    {...register("date")}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    id="event-date-input"
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.date.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Brief description of this event..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                  id="event-description-input"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Details (optional) */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <FileText size={10} />
                    Additional Details
                    <span className="text-gray-300">(optional)</span>
                  </span>
                </label>
                <textarea
                  {...register("details")}
                  rows={2}
                  placeholder="Extra info, requirements, meeting points..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
                  id="event-details-input"
                />
              </div>

              {/* Rewards */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Trophy size={10} />
                    Rewards
                    <span className="text-gray-300">(optional)</span>
                  </span>
                </label>
                <input
                  {...register("rewards")}
                  placeholder="e.g. 50 points + Bronze badge"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  id="event-rewards-input"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Event Image <span className="text-gray-300">(optional)</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-300 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={20} className="mx-auto text-gray-300 mb-1.5" />
                  <p className="text-xs text-gray-400 font-medium">
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="event-image-input"
                />
              </div>
            </form>

            {/* ── RIGHT: Live Preview ── */}
            <div
              className="px-6 py-5 hidden lg:flex flex-col"
              style={{ background: "#f9fbf9" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                Live Preview
              </p>

              <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                  {/* Date badge overlay */}
                  {previewDate && (
                    <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 shadow-md text-center min-w-[48px]">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">
                        {formattedMonth}
                      </p>
                      <p className="text-xl font-black text-gray-900 leading-tight">
                        {formattedDay}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="text-base font-black text-gray-900 tracking-tight leading-tight mb-1.5">
                    {watchedValues.name || (
                      <span className="text-gray-300">Event name...</span>
                    )}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span>{watchedValues.location || "Location..."}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
                    <CalendarDays size={11} className="shrink-0" />
                    <span>{formattedDate}</span>
                  </div>

                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                    {watchedValues.description || (
                      <span className="text-gray-300">Description...</span>
                    )}
                  </p>

                  {watchedValues.rewards && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Trophy size={11} style={{ color: "#96c93d" }} />
                      <span className="text-xs font-bold" style={{ color: "#25935f" }}>
                        {watchedValues.rewards}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4">
                  <div
                    className="w-full py-2.5 rounded-2xl text-sm font-black text-white text-center"
                    style={{ background: "#08351e" }}
                  >
                    Join Event
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
            id="event-form-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-white text-sm font-black shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
            style={{ background: "#96c93d" }}
            id="event-form-submit"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {editingEvent ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};
