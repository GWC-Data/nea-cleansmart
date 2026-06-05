import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner"; // For displaying field validation errors
import { DropdownInput } from "../../shared/dropdownInput";
import { apiService } from "../../../services/apiService";


interface LogActivityFormProps {
  // Legacy props
  elapsedSeconds?: number;
  location?: string;
  eventName?: string;
  isMandatory?: boolean;

  // New dashboard manual logging props
  joinedEvents?: any[];
  allEvents?: any[];
  organizations?: any[];
  isDashboardLog?: boolean;
  todayHours?: number;

  // Organization manual logging flow additions
  isOrgFlow?: boolean;
  currentUserId?: string;

  onCancel?: () => void;
  onSubmit: (
    weight: number,
    type: string,
    finalLocation: string,
    photo?: File,
    eventId?: string,
    date?: string,
    durationSeconds?: number
  ) => Promise<void> | void;
}

const WASTE_TYPES = [
  "Plastic Bags",
  "Plastic Containers (includes bottles, boxes packaging etc.)",
  "Other Plastics (includes straws, disposable cutleries, toys, lighters, grasscutter nylon strings etc.)",
  "Cigarette Butts",
  "Cigarette Boxes & Wrappers",
  "Paper Containers & Boxes",
  "Smaller Paper Items (includes tissue paper, receipts, tickets, flyers, envelopes etc.)",
  "Other Paper Items (newspapers, magazines, cardboards etc.)",
  "Styrofoam (includes boxes & packaging etc.)",
  "Glass (includes bottles, cups, bulbs etc.)",
  "Metal (drink cans, nails, screws etc.)",
  "E-waste (includes batteries, cables, appliances etc.)",
  "Others (includes bulk waste etc.)"
];

export const LogActivityForm: React.FC<LogActivityFormProps> = ({
  elapsedSeconds = 0,
  location = "",
  eventName,
  joinedEvents,
  allEvents,
  organizations,
  isDashboardLog = false,
  // todayHours = 0,
  onCancel,
  onSubmit,
  isMandatory,
  isOrgFlow = false,
  currentUserId,
}) => {
  const [weight, setWeight] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [manualLocation, setManualLocation] = useState(location || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // States for unified dashboard manual logging
  const [selectedEventId, setSelectedEventId] = useState("");
  // Prefill the cleanup date based on the user type: individuals select dates, organizations log for today in Singapore timezone
  const [cleanupDate, setCleanupDate] = useState(() => {
    if (isOrgFlow) {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
    }
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [durationSecs, setDurationSecs] = useState<number>(3600); // Default to 1 hour

  // Local state to store limit validation response from backend
  const [limitMaxHoursInfo, setLimitMaxHoursInfo] = useState<{ maxHours: number; userName: string }>({
    maxHours: 0,
    userName: ""
  });

  // Parse scanned attendee participant IDs for the selected event, filtering out the organization itself (currentUserId)
  const selectedEventAttendees = React.useMemo(() => {
    if (!isOrgFlow || !selectedEventId || !allEvents) return [];
    const fullEvent = allEvents.find((e) => e.eventId === selectedEventId);
    if (!fullEvent) return [];
    
    let attendees = fullEvent.attendentParticipant || [];
    if (typeof attendees === "string") {
      try {
        attendees = JSON.parse(attendees);
      } catch {
        attendees = [];
      }
    }
    
    return (Array.isArray(attendees) ? attendees : []).filter((uid: string) => uid !== currentUserId);
  }, [selectedEventId, allEvents, isOrgFlow, currentUserId]);

  // Fetch daily event limit information (max hours logged today) from the backend for users or scanned volunteers
  React.useEffect(() => {
    if (!selectedEventId || !cleanupDate) {
      setLimitMaxHoursInfo({ maxHours: 0, userName: "" });
      return;
    }

    const userIdsToCheck = isOrgFlow ? selectedEventAttendees : (currentUserId ? [currentUserId] : []);
    if (userIdsToCheck.length > 0) {
      apiService.checkAttendeeLimits(selectedEventId, cleanupDate, userIdsToCheck)
        .then((res) => {
          if (res) {
            setLimitMaxHoursInfo(res);
          }
        })
        .catch((err) => console.error("Failed to check attendee limits in form:", err));
    } else {
      setLimitMaxHoursInfo({ maxHours: 0, userName: "" });
    }
  }, [selectedEventId, cleanupDate, selectedEventAttendees, isOrgFlow, currentUserId]);

  // Aligned with the backend limit checking API, returns the maximum hours already logged today for this event
  const loggedHoursForSelectedEventAndDate = limitMaxHoursInfo.maxHours;

  // Filter events: only public events not created by organization leaders are allowed to be logged manually
  // If isOrgFlow is true, filter to display only private events created by the current organization
  const loggableEvents = React.useMemo(() => {
    if (isOrgFlow) {
      if (!allEvents || !currentUserId) return [];
      return allEvents.filter(
        (e) => e.createdBy === currentUserId
      );
    }

    if (!joinedEvents || !allEvents || !organizations) return [];
    return joinedEvents.filter((joinedEvent) => {
      const fullEvent = allEvents.find((e) => e.eventId === joinedEvent.eventId);
      if (!fullEvent) return false;
      
      // Exclude private events (only public events are loggable)
      if (fullEvent.eventType !== "public") return false;
      
      // Exclude completed/ended events
      const isCompleted = fullEvent.endDate ? new Date(fullEvent.endDate) < new Date() : false;
      if (isCompleted) return false;
      
      // Exclude organization-created events
      const isCreatedByOrg = organizations.some(
        (org) => org.orgId === fullEvent.createdBy
      );
      return !isCreatedByOrg;
    });
  }, [joinedEvents, allEvents, organizations, isOrgFlow, currentUserId]);

  // Map loggable events to the dropdown options format for the DropdownInput component
  const eventOptions = React.useMemo(() => {
    return loggableEvents.map((e: any) => ({
      value: e.eventId,
      label: e.eventName || e.name,
    }));
  }, [loggableEvents]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const fullEvent = allEvents?.find((e) => e.eventId === eventId);
    if (fullEvent) {
      if (fullEvent.location) {
        setManualLocation(fullEvent.location);
      } else {
        setManualLocation("");
      }

      // Automatically calculate duration from event schedule and cap at 2 hours for organization flow
      if (isOrgFlow) {
        if (fullEvent.startDate && fullEvent.endDate) {
          const start = new Date(fullEvent.startDate).getTime();
          const end = new Date(fullEvent.endDate).getTime();
          if (!isNaN(start) && !isNaN(end)) {
            const diffMs = end - start;
            const diffHours = diffMs / (3600 * 1000);
            
            // Map duration in seconds: 30m, 1h, 1.5h, 2h (capped at 2 hours per day per event)
            let calculatedSecs = 7200; // default cap
            if (diffHours <= 0.75) calculatedSecs = 1800;
            else if (diffHours <= 1.25) calculatedSecs = 3600;
            else if (diffHours <= 1.75) calculatedSecs = 5400;
            else calculatedSecs = 7200;

            setDurationSecs(calculatedSecs);
          }
        }

        // Prefill the cleanup date based on today's date in Singapore timezone for organization bulk check-in
        const todaySG = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
        setCleanupDate(todaySG);
      }
    } else {
      setManualLocation("");
      if (isOrgFlow) {
        const todaySG = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
        setCleanupDate(todaySG);
        setDurationSecs(3600);
      }
    }
  };

  // All standard duration options kept visible in the UI
  const DURATION_OPTIONS = React.useMemo(() => {
    return [
      { label: "30 Min", value: 1800 },
      { label: "1 Hour", value: 3600 },
      { label: "1.5 Hours", value: 5400 },
      { label: "2 Hours", value: 7200 },
    ];
  }, []);

  // Synchronize durationSecs so that if the currently selected option becomes disabled, a valid one is automatically selected
  React.useEffect(() => {
    if (!isOrgFlow && selectedEventId) {
      const remainingHoursForEvent = Math.max(0, 2 - loggedHoursForSelectedEventAndDate);
      const isCurrentOptionValid = (durationSecs / 3600) <= remainingHoursForEvent + 0.01;
      
      if (!isCurrentOptionValid) {
        // Find the largest valid duration option
        const validOptions = DURATION_OPTIONS.filter(
          (opt) => (opt.value / 3600) <= remainingHoursForEvent + 0.01
        );
        if (validOptions.length > 0) {
          setDurationSecs(validOptions[validOptions.length - 1].value);
        } else {
          setDurationSecs(0); // If daily limit is fully utilized, reset selection
        }
      }
    }
  }, [loggedHoursForSelectedEventAndDate, selectedEventId, isOrgFlow, durationSecs, DURATION_OPTIONS]);


  const getDurationText = () => {
    const elapsed = isDashboardLog ? durationSecs : elapsedSeconds;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type); // always allow uncheck
      }
      if (prev.length >= 3) return prev; // 👈 block if already 3 selected
      return [...prev, type];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if the submit button should be disabled based on status and time limit constraints, strictly cast to a boolean to prevent TypeScript type errors
  const isSubmitDisabled = !!(
    isSubmitting || 
    (isDashboardLog && !selectedEventId) ||
    (!isOrgFlow && isDashboardLog && durationSecs === 0) ||
    (isOrgFlow && selectedEventId && (loggedHoursForSelectedEventAndDate + durationSecs / 3600 > 2.01))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isDashboardLog && !selectedEventId) {
      toast.error("Please select an event.");
      return;
    }

    if (!isOrgFlow && isDashboardLog && durationSecs === 0) {
      toast.error("You have reached the maximum allowed limit of 2 hours for this event today.");
      return;
    }

    if (isDashboardLog && selectedEventId) {
      const remainingHoursForEvent = Math.max(0, 2 - loggedHoursForSelectedEventAndDate);
      if ((durationSecs / 3600) > remainingHoursForEvent + 0.01) {
        toast.error("Logging this activity would exceed the 2-hour daily limit for this event.");
        return;
      }
    }

    const finalLocation = isDashboardLog ? manualLocation : (location || manualLocation);

    // Validation for all fields: Location, weight, and waste types
    if (!finalLocation.trim()) {
      toast.error("Please enter the cleanup location.");
      return;
    }

    if (!weight.trim() || parseFloat(weight) <= 0) {
      toast.error("Please enter a valid estimated weight collected.");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one waste type.");
      return;
    }

    const typesJoined = selectedTypes.join(", ");

    setIsSubmitting(true);
    try {
      if (isDashboardLog) {
        await onSubmit(
          parseFloat(weight),
          typesJoined,
          finalLocation,
          photoFile ?? undefined,
          selectedEventId,
          cleanupDate,
          durationSecs
        );
      } else {
        await onSubmit(
          parseFloat(weight),
          typesJoined,
          finalLocation,
          photoFile ?? undefined,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Log Activity
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {isMandatory
                ? "⚠️ Please complete your previous session report"
                : isDashboardLog
                  ? "Log your manual clean-up activity"
                  : eventName
                    ? `Event: ${eventName}`
                    : "Session Report"}
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="cursor-pointer p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-5 pb-8 space-y-6">
          {!isDashboardLog && (
            /* Auto-filled details for legacy timer sessions */
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 shadow-sm">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Date</span>
                <span className="font-bold text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Duration</span>
                <span className="font-bold text-secondary">
                  {getDurationText()}
                </span>
              </div>
              {location && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Location</span>
                  <span
                    className="font-bold text-gray-900 text-right w-1/2 line-clamp-1 truncate"
                    title={location}
                  >
                    {location}
                  </span>
                </div>
              )}
            </div>
          )}

          <form id="logForm" onSubmit={handleSubmit} className="space-y-6">
            {isDashboardLog ? (
              /* Fields for Dashboard Manual Logging flow */
              <>
                {/* Date Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">
                    Date of Clean-up <span className="text-red-500 font-medium">*</span>
                  </label>
                  {/* Read-only / disabled date input field for organization flow to use the event's start date as the cleanup date */}
                  <input
                    type={isOrgFlow ? "text" : "date"}
                    value={isOrgFlow ? (!selectedEventId ? "N/A" : cleanupDate) : cleanupDate}
                    disabled={isOrgFlow}
                    max={isOrgFlow ? undefined : new Date().toISOString().split("T")[0]}
                    onChange={(e) => !isOrgFlow && setCleanupDate(e.target.value)}
                    onClick={(e) => {
                      if (isOrgFlow) return;
                      // Trigger native calendar popup when clicking anywhere in the input field
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {
                        console.warn("showPicker not supported on this browser context", err);
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none transition-all ${
                      isOrgFlow
                        ? "bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                        : "bg-background border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer"
                    }`}
                  />
                </div>

                {/* Time Slot (Duration) Selection - Rendered as a 2x2 grid of pill buttons */}
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-gray-900">
                    Time Slot / Duration <span className="text-red-500 font-medium">*</span>
                  </label>
                  {isOrgFlow ? (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Read-only automatically calculated duration displayed as a button style with white background and gray border. Shows "—" if no event is selected. */}
                      <div className="py-3.5 px-4 text-sm font-bold text-center border border-gray-200 bg-white rounded-2xl text-gray-700 font-semibold shadow-sm animate-in fade-in">
                        {!selectedEventId ? "N/A" : durationSecs === 1800 ? "30 Min" : durationSecs === 3600 ? "1 Hour" : durationSecs === 5400 ? "1.5 Hours" : "2 Hours"}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {DURATION_OPTIONS.map((opt) => {
                        const isSelected = durationSecs === opt.value;
                        const isDisabled = selectedEventId ? (loggedHoursForSelectedEventAndDate + opt.value / 3600 > 2.01) : false;
                        
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setDurationSecs(opt.value)}
                            className={`py-3.5 px-4 text-sm font-bold text-center border rounded-2xl transition-all shadow-sm ${
                              isDisabled
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                : isSelected
                                  ? "bg-soft border-secondary text-secondary font-extrabold cursor-pointer active:scale-[0.98]"
                                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer active:scale-[0.98]"
                            }`}
                          >
                            {opt.label}
                            {/* {isDisabled && (
                              <span className="block text-[10px] font-medium text-gray-400 mt-0.5">
                                (Exceeds Limit)
                              </span>
                            )} */}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Warning messages and clear UI feedback on time limits */}
                  {selectedEventId && (
                    <div className="space-y-2">
                      {isOrgFlow ? (
                        loggedHoursForSelectedEventAndDate + durationSecs / 3600 > 2.01 && (
                          <div className="text-xs text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200 font-semibold animate-in fade-in">
                            Reached the daily hours limit for this event.
                          </div>
                        )
                      ) : loggedHoursForSelectedEventAndDate >= 1.99 ? (
                        <div className="text-xs text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200 font-semibold animate-in fade-in">
                          You have reached the maximum allowed limit of 2 hours for this event today.
                        </div>
                      ) : loggedHoursForSelectedEventAndDate > 0 ? (
                        <div className="text-xs text-amber-600 bg-amber-50 p-3.5 rounded-xl border border-amber-200 font-semibold animate-in fade-in">
                          Some duration options are disabled to prevent exceeding the 2-hour daily limit for this event.
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>


                {/* Event Selection - Custom dropdown input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">
                    Event Type <span className="text-red-500 font-medium">*</span>
                  </label>
                  {loggableEvents.length === 0 ? (
                    <div className="text-xs text-amber-600 bg-amber-50 p-3.5 rounded-xl border border-amber-200 font-medium">
                      {isOrgFlow
                        ? "No private events created by your organization were found."
                        : "No eligible joined events found. Please join a public or non-organization events."}
                    </div>
                  ) : (
                    <DropdownInput
                      label="Events"
                      options={eventOptions}
                      value={selectedEventId}
                      onChange={handleEventChange}
                      placeholder="Select an Event"
                    />
                  )}
                </div>


                {/* Location Input (Prefilled but editable) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">
                    Location <span className="text-red-500 font-medium">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. East Coast Park"
                    className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              </>
            ) : (
              /* Legacy Location Input if not dashboard manual logging */
              !location && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">
                    Location <span className="text-red-500 font-medium">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. East Coast Park"
                    className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              )
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Estimated Weight Collected{" "}
                <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-full bg-background border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  kg
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">
                Select up to 3 waste types{" "}
                <span className="text-red-500 font-medium">*</span>
              </label>
              <div className="space-y-2.5">
                {WASTE_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all shadow-sm ${selectedTypes.includes(type) ? "bg-soft border-secondary/40" : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleToggleType(type)}
                      className="mt-0.5 w-4 h-4 text-secondary bg-white border-gray-300 rounded focus:ring-secondary accent-secondary"
                    />
                    <span
                      className={`text-sm leading-snug font-medium ${selectedTypes.includes(type) ? "text-primary-dark" : "text-gray-700"}`}
                    >
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">
                Photo Evidence{" "}
                <span className="text-gray-400 font-medium">(Optional)</span>
              </label>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {photoPreview ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-white text-[10px] font-medium truncate max-w-[200px] block">
                      {photoFile?.name}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-secondary hover:bg-green-50/50 p-6 rounded-xl text-center flex flex-col items-center gap-3 transition-all group"
                >
                  <div className="bg-gray-100 group-hover:bg-soft p-3 rounded-full transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-secondary" />
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-secondary font-semibold">
                    Tap to upload a photo
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG, WEBP supported
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
          <button
            type="submit"
            form="logForm"
            disabled={isSubmitDisabled}
            className="cursor-pointer w-full bg-secondary hover:bg-secondary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] text-base"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
};
