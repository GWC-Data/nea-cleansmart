/**
 * EventFormModal.tsx
 * Professional create/edit event modal with form validation and live preview.
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
import { getEventImageUrl } from "../../utils/imageUtils";

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

  useEffect(() => {
    if (editingEvent) {
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
      // when editing event
      if (editingEvent.eventImage) {
        // Use getEventImageUrl to resolve the remote path
        setImagePreview(getEventImageUrl(editingEvent.eventImage));
      } else {
        setImagePreview(null);
      }
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
      // when editing event
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
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const previewDate = watchedValues.date ? new Date(watchedValues.date) : null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2A3A]/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF2] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight">
              {editingEvent ? "Edit Event" : "Create Event"}
            </h2>
            {/* <p className="text-xs text-[#8A9AA8] font-medium mt-0.5">
              {editingEvent
                ? "Update event details below"
                : "Fill in the details to create a new event"}
            </p> */}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#8A9AA8] hover:text-[#1A2A3A]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full min-h-0">
            {/* LEFT: Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              id="event-form"
              noValidate
              className="px-6 py-5 space-y-4 border-r border-[#E8EDF2] overflow-y-auto event-form-scroll"
            >
              {/* Name */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  Event Name <span className="text-[#EC5594]">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. East Coast Park Clean-Up"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                />
                {errors.name && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  Location <span className="text-[#EC5594]">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
                  />
                  <input
                    {...register("location")}
                    placeholder="e.g. East Coast Park, Singapore"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                  />
                </div>
                {errors.location && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  Date & Time <span className="text-[#EC5594]">*</span>
                </label>
                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
                  />
                  <input
                    type="datetime-local"
                    {...register("date")}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] focus:outline-none focus:border-[#509CD1] transition-colors"
                  />
                </div>
                {errors.date && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  Description <span className="text-[#EC5594]">*</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Brief description of this event..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors resize-none"
                />
                {errors.description && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Details (optional) */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  <span className="flex items-center gap-1">
                    <FileText size={10} />
                    Details{" "}
                  </span>
                </label>
                <textarea
                  {...register("details")}
                  rows={2}
                  placeholder="Extra info, requirements, meeting points..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors resize-none"
                />
              </div>

              {/* Rewards */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  <span className="flex items-center gap-1">
                    <Trophy size={10} />
                    Rewards
                  </span>
                </label>
                <input
                  {...register("rewards")}
                  placeholder="e.g. 50 points + Bronze badge"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-sm font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-1.5">
                  Event Image
                </label>
                <div
                  className="border-2 border-dashed border-[#E8EDF2] rounded-lg p-4 text-center cursor-pointer hover:border-[#509CD1] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon
                    size={20}
                    className="mx-auto text-[#A0AAB5] mb-1.5"
                  />
                  <p className="text-xs text-[#6B7A88] font-medium">
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </p>
                  <p className="text-[10px] text-[#A0AAB5] mt-0.5">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </form>

            {/* RIGHT: Live Preview */}
            <div
              className="px-6 py-5 hidden lg:flex flex-col overflow-hidden"
              style={{ background: "#F8F9FB" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A9AA8] mb-4">
                Live Preview
              </p>

              <div className="bg-white rounded-xl shadow-md border border-[#E8EDF2] overflow-hidden">
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-[#F5F7FA] to-[#E8EDF2] overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-[#A0AAB5]" />
                    </div>
                  )}
                  {previewDate && (
                    <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1.5 shadow-sm text-center min-w-[48px]">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8A9AA8] leading-none">
                        {formattedMonth}
                      </p>
                      <p className="text-xl font-bold text-[#1A2A3A] leading-tight">
                        {formattedDay}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[#1A2A3A] tracking-tight leading-tight mb-1.5">
                    {watchedValues.name || (
                      <span className="text-[#A0AAB5]">Event name...</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7A88] font-medium mb-1">
                    <MapPin size={11} className="text-[#8A9AA8] shrink-0" />
                    <span>{watchedValues.location || "Location..."}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A9AA8] font-medium mb-3">
                    <CalendarDays size={11} className="shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                  {/* <p className="text-xs text-[#6B7A88] font-medium leading-relaxed line-clamp-2">
                    {watchedValues.description || (
                      <span className="text-[#A0AAB5]">Description...</span>
                    )}
                  </p> */}
                  {watchedValues.rewards && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Trophy size={11} style={{ color: "#86B537" }} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#86B537" }}
                      >
                        {watchedValues.rewards}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {/* <div className="px-4 pb-4">
                  <div
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                    style={{ background: "#108ACB" }}
                  >
                    Join Event
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-[#E8EDF2] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-5 py-2.5 rounded-lg border border-[#E8EDF2] text-[#6B7A88] text-sm font-semibold hover:bg-[#F5F7FA] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            className="cursor-pointer px-6 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
            style={{ background: "#86B537" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#75A030";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#86B537";
            }}
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {editingEvent ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};
