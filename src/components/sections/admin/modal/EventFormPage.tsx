/**
 * EventFormPage.tsx
 * Professional create/edit event form supporting both standalone full-page and modal layouts.
 */

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  ImageIcon,
  Loader2,
  Trophy,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { adminApiService } from "../../../../services/adminApiService";
import type { EventData } from "../../../../types/api.types";
import { getEventImageUrl } from "../../../../utils/imageUtils";
import { Calendar } from "../../../ui/calendar";
import { format, startOfDay } from "date-fns";
import clsx from "clsx";

const parseLocalISO = (isoString: string) => {
  if (!isoString) return null;
  const clean = isoString.replace(/Z$|[+-]\d{2}:\d{2}$/, "");
  return new Date(clean);
};

const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  details: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rewards: z.string().optional(),
  eventType: z.enum(["public", "private"]),
  userCount: z.union([z.string(), z.number()]).optional(),
});

export type EventFormFields = z.infer<typeof eventSchema>;

interface EventFormPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data?: EventData) => void;
  editingEvent?: EventData | null;
  showEventTypeToggle?: boolean;
  onSubmitOverride?: (
    values: EventFormFields,
    imageFile: File | null,
  ) => Promise<void>;
  isPage?: boolean;
}

export const EventFormPage: React.FC<EventFormPageProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingEvent,
  showEventTypeToggle,
  onSubmitOverride,
  isPage = false,
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
    setValue,
    formState: { errors },
  } = useForm<EventFormFields>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      details: "",
      location: "",
      startDate: "",
      endDate: "",
      rewards: "",
      eventType: "public",
      userCount: "",
    },
  });

  const watchedValues = watch();

  const calendarValue = React.useMemo(() => {
    return {
      start: watchedValues.startDate
        ? parseLocalISO(watchedValues.startDate)
        : null,
      end: watchedValues.endDate ? parseLocalISO(watchedValues.endDate) : null,
    };
  }, [watchedValues.startDate, watchedValues.endDate]);

  const handleCalendarChange = (
    range: { start: Date | null; end: Date | null } | null,
  ) => {
    if (!range) {
      setValue("startDate", "");
      setValue("endDate", "");
    } else {
      setValue(
        "startDate",
        range.start ? format(range.start, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : "",
      );
      setValue(
        "endDate",
        range.end ? format(range.end, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : "",
      );
    }
  };

  useEffect(() => {
    if (editingEvent) {
      reset({
        name: editingEvent.name || "",
        description: editingEvent.description || "",
        details: editingEvent.details || "",
        location: editingEvent.location || "",
        startDate: editingEvent.startDate || "",
        endDate: editingEvent.endDate || "",
        rewards: editingEvent.rewards || "",
        eventType: editingEvent.eventType || "public",
        userCount: editingEvent.userCount || "",
      });
      setImagePreview(editingEvent.eventImage || null);
      setImageFile(null);
      if (editingEvent.eventImage) {
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
        startDate: "",
        endDate: "",
        rewards: "",
        eventType: "public",
        userCount: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingEvent, reset, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 1MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: EventFormFields) => {
    setIsSubmitting(true);
    try {
      if (onSubmitOverride) {
        await onSubmitOverride(values, imageFile);
        onSuccess();
      } else {
        const startTimeStr = values.startDate
          ? format(parseLocalISO(values.startDate)!, "HH:mm")
          : "00:00";

        const payload = {
          ...values,
          time: startTimeStr,
          ...(imageFile ? { eventImage: imageFile } : {}),
        };

        const result = editingEvent
          ? await adminApiService.updateEvent(editingEvent.eventId, payload)
          : await adminApiService.createEvent(payload);

        if (result) {
          toast.success(
            editingEvent
              ? "Event updated successfully!"
              : "Event created successfully!",
          );
          onSuccess(result);
        }
      }
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

  const previewDate = watchedValues.startDate
    ? parseLocalISO(watchedValues.startDate)
    : null;
  const formattedMonth = previewDate
    ? previewDate.toLocaleDateString("en-SG", { month: "short" }).toUpperCase()
    : "";
  const formattedDay = previewDate
    ? previewDate.toLocaleDateString("en-SG", { day: "numeric" })
    : "";

  const renderContent = () => (
    <>
      {/* Header */}
      {/* <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF2] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1A2A3A] tracking-tight">
            {editingEvent ? "Edit Event" : "Create Event"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#8A9AA8] hover:text-[#1A2A3A]"
        >
          <X size={20} />
        </button>
      </div> */}

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-white overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 w-full lg:min-h-0">
          {/* LEFT: Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="event-form"
            noValidate
            className="px-6 py-6 space-y-4 lg:overflow-y-auto lg:overflow-x-hidden lg:h-full shrink-0 lg:shrink"
          >
            {/* Name */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                  Event Name <span className="text-[#EC5594]">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. East Coast Park Clean-Up"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                />
                {errors.name && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="flex-1">
                <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                  Location <span className="text-[#EC5594]">*</span>
                </label>
                <input
                  {...register("location")}
                  placeholder="e.g. East Coast Park, Singapore"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                />
                {errors.location && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                  Start Date <span className="text-[#EC5594]">*</span>
                </label>
                <div className="relative w-full">
                  <Calendar
                    value={calendarValue}
                    onChange={handleCalendarChange}
                    showTimeInput={true}
                    mode="start"
                    minValue={startOfDay(new Date())}
                    className="w-full"
                  />
                </div>
                {errors.startDate && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                  End Date <span className="text-[#EC5594]">*</span>
                </label>
                <div className="relative w-full">
                  <Calendar
                    value={calendarValue}
                    onChange={handleCalendarChange}
                    showTimeInput={true}
                    mode="end"
                    popoverAlignment="end"
                    minValue={calendarValue.start ? startOfDay(calendarValue.start) : startOfDay(new Date())}
                    className="w-full"
                  />
                </div>
                {errors.endDate && (
                  <p className="text-[#EC5594] text-xs mt-1 font-medium">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                Description <span className="text-[#EC5594]">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Brief description of this event..."
                className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors resize-none"
              />
              {errors.description && (
                <p className="text-[#EC5594] text-xs mt-1 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {showEventTypeToggle && (
              <div
                className={clsx(
                  "flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5",
                  watchedValues.eventType === "public" && "items-start",
                )}
              >
                <div className="flex-1 min-w-0">
                  <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                    Event Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="private"
                        {...register("eventType")}
                        className="accent-[#509CD1]"
                      />
                      <span className="text-[12px] font-medium text-[#1A2A3A]">
                        Private Event
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="public"
                        {...register("eventType")}
                        className="accent-[#509CD1]"
                      />
                      <span className="text-[12px] font-medium text-[#1A2A3A]">
                        Public Event
                      </span>
                    </label>
                  </div>
                  <p className="text-[12px] text-[#8A9AA8] mt-1.5">
                    {watchedValues.eventType === "private"
                      ? "Only visible to your organization."
                      : "Visible publicly to everyone."}
                  </p>
                </div>

                {watchedValues.eventType === "public" && (
                  <div className="flex-1 min-w-0">
                    <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                      Participant Limit
                    </label>
                    <div className="relative">
                      <Users
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AAB5]"
                      />
                      <input
                        type="number"
                        {...register("userCount")}
                        placeholder="e.g. 50 (leave empty for unlimited)"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                Details
              </label>
              <textarea
                {...register("details")}
                rows={2}
                placeholder="Extra info, requirements, meeting points..."
                className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors resize-none"
              />
            </div>

            {/* Rewards */}
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
                Rewards
              </label>
              <input
                {...register("rewards")}
                placeholder="e.g. 50 points + Bronze badge"
                className="w-full px-4 py-2.5 rounded-lg border border-[#E8EDF2] text-[12px] font-medium text-[#1A2A3A] placeholder:text-[#A0AAB5] focus:outline-none focus:border-[#509CD1] transition-colors"
              />
            </div>
          </form>

          {/* RIGHT: Live Preview & Image Upload */}
          <div className="px-6 lg:pl-0 lg:pr-6 py-5 flex flex-col gap-6 lg:overflow-y-auto lg:h-full shrink-0 lg:shrink">
            {/* Image Upload */}
            <div>
              <label className="block text-[12px] font-semibold uppercase text-[#4A5568] mb-1.5">
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
                <p className="text-[12px] text-[#6B7A88] font-medium">
                  {imageFile ? imageFile.name : "Click to upload image"}
                </p>
                <p className="text-[12px] text-[#A0AAB5] mt-0.5">
                  PNG, JPG less than 1MB
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

            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8A9AA8]">
              Live Preview
            </p>

            <div className="bg-white rounded-xl shadow-md border border-[#E8EDF2] overflow-hidden">
              <div className="relative h-48 bg-linear-to-br from-[#F5F7FA] to-[#E8EDF2] overflow-hidden">
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
                    <p className="text-[9px] font-semibold uppercase text-[#8A9AA8] leading-none">
                      {formattedMonth}
                    </p>
                    <p className="text-xl font-bold text-[#1A2A3A] leading-tight">
                      {formattedDay}
                    </p>
                  </div>
                )}
              </div>

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
                {showEventTypeToggle && (
                  <div className="inline-block px-2 py-0.5 rounded-full bg-[#E8EDF2] text-[10px] font-bold text-[#6B7A88] uppercase mb-2">
                    {watchedValues.eventType === "private"
                      ? "Private"
                      : "Public"}
                  </div>
                )}
                {/* Need to display the discription in the preview as well */}
                {watchedValues.description && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <FileText size={11} className="text-[#8A9AA8] shrink-0" />
                    <span className="text-xs text-[#6B7A88] font-medium">
                      {watchedValues.description}
                    </span>
                  </div>
                )}
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 px-6 pt-3 flex items-center justify-end gap-3">
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
    </>
  );

  if (isPage) {
    return <div>{renderContent()}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2A3A]/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};
