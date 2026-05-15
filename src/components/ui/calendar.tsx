import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  isWithinInterval,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  sub,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./button-1";
import { Material } from "./material-1";
import { Input } from "./input";
import { Select } from "./select-1";
import { formatInTimeZone /*, fromZonedTime*/ } from "date-fns-tz"; // Commented out unused fromZonedTime import
import { useClickOutside } from "./use-click-outside";
import clsx from "clsx";
import { enUS } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

const ClockIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8.75 4.75V4H7.25V4.75V7.875C7.25 8.18976 7.39819 8.48615 7.65 8.675L9.55 10.1L10.15 10.55L11.05 9.35L10.45 8.9L8.75 7.625V4.75Z"
      className="fill-gray-1000"
    />
  </svg>
);

const ArrowBottomIcon = ({ className }: { className?: string }) => (
  <svg
    height="16"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width="16"
    className={clsx("fill-gray-1000", className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 14.0607L9.96966 13.5303L5.14644 8.7071C4.75592 8.31658 4.75592 7.68341 5.14644 7.29289L9.96966 2.46966L10.5 1.93933L11.5607 2.99999L11.0303 3.53032L6.56065 7.99999L11.0303 12.4697L11.5607 13L10.5 14.0607Z"
      className="fill-gray-700"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.50001 1.93933L6.03034 2.46966L10.8536 7.29288C11.2441 7.68341 11.2441 8.31657 10.8536 8.7071L6.03034 13.5303L5.50001 14.0607L4.43935 13L4.96968 12.4697L9.43935 7.99999L4.96968 3.53032L4.43935 2.99999L5.50001 1.93933Z"
      className="fill-gray-700"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 0.5V1.25V2H10.5V1.25V0.5H12V1.25V2H14H15.5V3.5V13.5C15.5 14.8807 14.3807 16 13 16H3C1.61929 16 0.5 14.8807 0.5 13.5V3.5V2H2H4V1.25V0.5H5.5ZM2 3.5H14V6H2V3.5ZM2 7.5V13.5C2 14.0523 2.44772 14.5 3 14.5H13C13.5523 14.5 14 14.0523 14 13.5V7.5H2Z"
    />
  </svg>
);

const ClearIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z"
    />
  </svg>
);

const parseRelativeDate = (input: string) => {
  const regex = /(\d+)\s*(day|week|month|year|hour)s?/i;
  const match = input.match(regex);

  if (!match) {
    return null;
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase() + "s";

  const now = new Date();
  const start = startOfDay(sub(now, { [unit]: value }));
  const end = endOfDay(now);

  return {
    [input]: { text: input, start, end },
  };
};

const parseFixedRange = (input: string) => {
  const rangePattern = /(.+)\s*[-–]\s*(.+)/;

  const match = input.match(rangePattern);
  if (!match) {
    return parseExactDate(input);
  }

  const [, startStr, endStr] = match;
  if (!startStr || !endStr) {
    return null;
  }

  const possibleFormats = ["d MMM yyyy", "d MMM", "yyyy-MM-dd"];

  for (const format of possibleFormats) {
    const now = new Date();
    const year = now.getFullYear();

    const start = parse(startStr, format, now, { locale: enUS });
    const end = parse(endStr, format, now, { locale: enUS });

    const finalStart = isValid(start) ? startOfDay(start) : null;
    const finalEnd = isValid(end) ? endOfDay(end) : null;

    if (finalStart && finalEnd) {
      if (format === "d MMM") {
        finalStart.setFullYear(year);
        finalEnd.setFullYear(year);
      }
      return {
        [input]: { text: input, start: finalStart, end: finalEnd },
      };
    }
  }

  return null;
};

const parseExactDate = (input: string) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const dateFormats = ["d MMM yyyy", "d MMM", "yyyy-MM-dd"];

  for (const format of dateFormats) {
    let date = parse(input.trim(), format, now, { locale: enUS });

    if (isValid(date)) {
      if (format === "d MMM") {
        date.setFullYear(currentYear);
      }

      return {
        [input]: {
          text: input,
          start: startOfDay(date),
          end: endOfDay(date),
        },
      };
    }
  }

  return null;
};

const parseDateInput = (input: string) => {
  const relative = parseRelativeDate(input);
  if (relative) return relative;

  const fixedRange = parseFixedRange(input);
  if (fixedRange) return fixedRange;

  const exact = parseExactDate(input);
  if (exact) return exact;

  return null;
};

const filterPresets = (obj: Record<string, any>, search: string) => {
  if (!search) {
    return obj;
  }

  const searchWords = search.toLowerCase().split("-").filter(Boolean);

  const filtered = Object.fromEntries(
    Object.entries(obj).filter(([, /* _ */ value]) => {
      // Commented out unused variable from destructuring
      const keyLower = value.text.toLowerCase();
      return searchWords.every((word) => keyLower.includes(word));
    }),
  );

  if (Object.entries(filtered).length > 0) {
    return filtered;
  }

  const parsed = parseDateInput(search);
  if (parsed) {
    return parsed;
  }

  const numberMatch = search.match(/\d+/);
  if (!numberMatch) {
    return {};
  }

  const n = parseInt(numberMatch[0], 10);
  const now = new Date();

  return {
    [`last-${n}-days`]: {
      text: `Last ${n} Days`,
      start: startOfDay(subDays(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-weeks`]: {
      text: `Last ${n} Weeks`,
      start: startOfDay(subWeeks(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-months`]: {
      text: `Last ${n} Months`,
      start: startOfDay(subMonths(now, n)),
      end: endOfDay(now),
    },
    [`last-${n}-years`]: {
      text: `Last ${n} Years`,
      start: startOfDay(subYears(now, n)),
      end: endOfDay(now),
    },
  };
};

const formatDateRange = (start: Date, end: Date, timezone: string) => {
  const isStartMidnight = isEqual(start, startOfDay(start));
  const isEndEOD = isEqual(end, endOfDay(end));
  const sameDay = isSameDay(start, end);

  const formatSingle = (date: Date) =>
    formatInTimeZone(
      date,
      timezone,
      isStartMidnight ? "EEE, MMM d" : "EEE, MMM d, HH:mm",
    );

  const formatMonth = (date: Date) => formatInTimeZone(date, timezone, "MMM");
  const formatDay = (date: Date) => formatInTimeZone(date, timezone, "d");
  const formatYear = (date: Date) => formatInTimeZone(date, timezone, "yy");

  const formatDateWithTimeIfNeeded = (date: Date, showTime: boolean) =>
    formatInTimeZone(date, timezone, showTime ? "MMM d, HH:mm" : "MMM d");

  if (sameDay) {
    return formatSingle(start);
  }

  const sameMonth =
    formatMonth(start) === formatMonth(end) &&
    formatYear(start) === formatYear(end);
  const sameYear = formatYear(start) === formatYear(end);

  const startHasTime = !isStartMidnight;
  const endHasTime = !isEndEOD;

  if (startHasTime || endHasTime) {
    const startFormatted = formatDateWithTimeIfNeeded(start, startHasTime);
    const endFormatted = formatDateWithTimeIfNeeded(end, endHasTime);
    return `${startFormatted} - ${endFormatted}`;
  }

  if (sameMonth) {
    return `${formatMonth(start)} ${formatDay(start)} - ${formatDay(end)}`;
  }

  if (sameYear) {
    return `${formatMonth(start)} ${formatDay(start)} - ${formatMonth(end)} ${formatDay(end)}`;
  }

  return `${formatMonth(start)} ${formatDay(start)} '${formatYear(start)} - ${formatMonth(end)} ${formatDay(end)} '${formatYear(end)}`;
};

const typeRelativeTimes = [
  {
    text: "45m",
    start: subMinutes(new Date(), 45),
    end: new Date(),
  },
  {
    text: "12 hours",
    start: subHours(new Date(), 12),
    end: new Date(),
  },
  {
    text: "10d",
    start: startOfDay(subDays(new Date(), 10)),
    end: endOfDay(new Date()),
  },
  {
    text: "2 weeks",
    start: startOfDay(subWeeks(new Date(), 2)),
    end: endOfDay(new Date()),
  },
  {
    text: "last month",
    start: startOfDay(subMonths(new Date(), 1)),
    end: endOfDay(new Date()),
  },
  {
    text: "yesterday",
    start: startOfDay(subDays(new Date(), 1)),
    end: endOfDay(subDays(new Date(), 1)),
  },
  {
    text: "today",
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  },
];
const typeFixedTimes = [
  {
    text: "Jan 1",
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 1)),
  },
  {
    text: "Jan 1 - Jan 2",
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 2)),
  },
  {
    text: "1/1",
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 1)),
  },
  {
    text: "1/1 - 1/2",
    start: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
    end: endOfDay(new Date(new Date().getFullYear(), 0, 2)),
  },
];

interface CalendarComboboxProps {
  stacked: boolean;
  compact: boolean;
  value: RangeValue | null;
  onChange: (date: RangeValue | null) => void;
  presets: {
    [key: string]: {
      text: string;
      start: Date;
      end: Date;
    };
  };
  presetIndex?: number;
}

const CalendarCombobox = ({
  stacked,
  compact,
  value,
  onChange,
  presets,
  presetIndex,
}: CalendarComboboxProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [currentPreset, setCurrentPreset] = useState<any | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const onFocus = () => {
    setIsOpen(true);
  };

  const onChangeInputValue = (value: string) => {
    setInputValue(value);
  };

  const onClick = (value: any) => {
    setInputValue(value.text);
    setCurrentPreset(value);
    onChange({ start: value.start, end: value.end });
    setIsOpen(false);
  };

  const filteredPresets = filterPresets(presets, inputValue);

  useClickOutside(ref, () => setIsOpen(false));

  useEffect(() => {
    const array = Object.entries(presets);
    if (
      presetIndex !== undefined &&
      presetIndex >= 0 &&
      presetIndex < array.length
    ) {
      setInputValue(array[presetIndex][1].text);
      setCurrentPreset(array[presetIndex][1]);
      onChange({
        start: array[presetIndex][1].start,
        end: array[presetIndex][1].end,
      });
    }
  }, [presetIndex]);

  useEffect(() => {
    if (currentPreset) {
      if (
        currentPreset.start !== value?.start ||
        currentPreset.end !== value?.end
      ) {
        setCurrentPreset(null);
        setInputValue("");
      }
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className={twMerge(
        clsx(
          "inline-block text-sm font-sans",
          compact ? "w-[180px] absolute left-[38px]" : "w-[250px] relative",
          compact && !isOpen && "pl-[140px]",
          compact &&
            (isOpen ||
              (currentPreset &&
                currentPreset?.start === value?.start &&
                currentPreset?.end === value?.end)) &&
            "pl-0",
        ),
      )}
    >
      <Input
        prefix={compact ? undefined : <ClockIcon />}
        prefixStyling={"pl-2.5"}
        suffix={
          <ArrowBottomIcon
            className={clsx("duration-200", isOpen && "rotate-180")}
          />
        }
        suffixStyling={clsx(
          "cursor-pointer",
          compact &&
            !isOpen &&
            (!currentPreset ||
              (currentPreset?.start !== value?.start &&
                currentPreset?.end !== value?.end)) &&
            "w-10 !px-0",
        )}
        placeholder="Select Period"
        onFocus={onFocus}
        value={inputValue}
        onChange={onChangeInputValue}
        wrapperClassName={clsx(
          "hover:z-10",
          stacked && !compact && "rounded-b-none",
          !stacked && !compact && "rounded-r-none",
          compact && "rounded-l-none",
          (isOpen ||
            (compact &&
              currentPreset &&
              currentPreset?.start === value?.start &&
              currentPreset?.end === value?.end)) &&
            "z-10",
        )}
        className={clsx(
          "pl-2 placeholder:text-gray-1000! placeholder:opacity-100!",
          compact &&
            !isOpen &&
            (!currentPreset ||
              (currentPreset?.start !== value?.start &&
                currentPreset?.end !== value?.end)) &&
            "w-0! px-0!",
        )}
      />
      <Material
        type="menu"
        className={clsx(
          "absolute z-50 top-12 left-0",
          compact ? "w-full" : "grid grid-cols-2 w-[200%]",
          isOpen && "opacity-100",
          !isOpen && "opacity-0 pointer-events-none duration-200",
        )}
      >
        <ul className="p-2 border-r border-r-gray-200">
          {Object.entries(filteredPresets).length > 0 ? (
            Object.entries(filteredPresets).map(([key, value]) => (
              <li
                key={key}
                className="flex items-center cursor-pointer px-2 w-full h-9 rounded-md hover:bg-gray-alpha-300 active:bg-gray-alpha-300 font-sans text-sm text-gray-1000"
                onClick={() => onClick(value)}
              >
                {value.text}
              </li>
            ))
          ) : (
            <li className="flex items-center cursor-pointer px-2 w-full h-9 rounded-md hover:bg-gray-alpha-300 active:bg-gray-alpha-300 font-sans text-sm text-gray-1000">
              {inputValue}
            </li>
          )}
        </ul>
        {!compact && (
          <div className="p-4 pr-[30px]">
            <div className="font-sans text-gray-900 text-sm">
              Type relative times
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {typeRelativeTimes.map((value) => (
                <button
                  key={value.text}
                  className="font-mono text-[13px] text-gray-1000 px-1.5 h-5 inline-flex items-center bg-accents-2 border-none rounded cursor-pointer"
                  onClick={() => onClick(value)}
                >
                  {value.text}
                </button>
              ))}
            </div>
            <div className="font-sans text-gray-900 text-sm mt-4">
              Type fixed times
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {typeFixedTimes.map((value) => (
                <button
                  key={value.text}
                  className="font-mono text-[13px] text-gray-1000 px-1.5 h-5 inline-flex items-center bg-accents-2 border-none rounded cursor-pointer"
                >
                  {value.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </Material>
    </div>
  );
};

export interface RangeValue {
  start: Date | null;
  end: Date | null;
}

interface CalendarProps {
  allowClear?: boolean;
  compact?: boolean;
  isDocsPage?: boolean;
  stacked?: boolean;
  horizontalLayout?: boolean;
  showTimeInput?: boolean;
  popoverAlignment?: "start" | "center" | "end";
  value: RangeValue | null;
  onChange: (date: RangeValue | null) => void;
  presets?: {
    [key: string]: {
      text: string;
      start: Date;
      end: Date;
    };
  };
  presetIndex?: number;
  minValue?: Date;
  maxValue?: Date;
  mode?: "start" | "end" | "range";
  className?: string;
}

export const Calendar = ({
  compact = false,
  stacked = false,
  horizontalLayout = false,
  showTimeInput = true,
  popoverAlignment = "start",
  value,
  onChange,
  presets,
  presetIndex,
  minValue,
  maxValue,
  mode = "range",
  className,
}: CalendarProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const timezones = useMemo(
    () => [
      {
        value: "UTC",
        label: "UTC",
      },
      {
        value: Intl.DateTimeFormat().resolvedOptions().timeZone,
        label: `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
      },
    ],
    [],
  );
  const [selectedTimezone /*, setSelectedTimezone*/] = useState(
    timezones[1].value,
  ); // Commented out unused setter
  const [/*startDate*/, setStartDate] = useState<string>(
    value?.start
      ? formatInTimeZone(value.start, selectedTimezone, "MMM dd, yyyy")
      : "",
  ); // Commented out unused variable
  const [startTime, setStartTime] = useState<string>(
    value?.start
      ? formatInTimeZone(value.start, selectedTimezone, "HH:mm")
      : "",
  );
  const [manualStartTime, setManualStartTime] = useState<string>("");
  const [/*endDate*/, setEndDate] = useState<string>(
    value?.end
      ? formatInTimeZone(value.end, selectedTimezone, "MMM dd, yyyy")
      : "",
  ); // Commented out unused variable
  const [endTime, setEndTime] = useState<string>(
    value?.end ? formatInTimeZone(value.end, selectedTimezone, "HH:mm") : "",
  );
  const [manualEndTime, setManualEndTime] = useState<string>("");
  const [/*startDateError*/ /*, setStartDateError*/] = useState<boolean>(false); // Commented out unused variable and setter
  const [startTimeError /*, setStartTimeError*/] = useState<boolean>(false); // Commented out unused setter
  const [/*endDateError*/ /*, setEndDateError*/] = useState<boolean>(false); // Commented out unused variable and setter
  const [endTimeError /*, setEndTimeError*/] = useState<boolean>(false); // Commented out unused setter
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(calendarRef, () => setIsOpen(false));

  useEffect(() => {
    window.addEventListener("resize", () => setIsOpen(false));
    window.addEventListener("scroll", () => setIsOpen(false));

    return () => {
      window.removeEventListener("resize", () => setIsOpen(false));
      window.removeEventListener("scroll", () => setIsOpen(false));
    };
  }, []);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const daysArray = [];
  let day = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  while (day <= endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })) {
    daysArray.push(day);
    day = addDays(day, 1);
  }

  const handleDateClick = (day: Date) => {
    if (mode === "start") {
      const [hours, minutes] = startTime.split(":").map(Number);
      const newStart = new Date(day);
      newStart.setHours(
        isNaN(hours) ? 0 : hours,
        isNaN(minutes) ? 0 : minutes,
        0,
        0,
      );
      onChange({ start: newStart, end: value?.end || null });
      // Keep it open to allow time adjustment if needed, or close if you prefer.
      // Usually, selecting a date closes the popover in many pickers,
      // but here we might want to stay open if they need to adjust time.
      // However, the user's issue was that it took 00:00 by default.
      // Removing setIsOpen(false) to allow time selection after date selection
      // setIsOpen(false);
    } else if (mode === "end") {
      const [hours, minutes] = endTime.split(":").map(Number);
      const newEnd = new Date(day);
      if (endTime === "" || (hours === 0 && minutes === 0)) {
        // Default to end of day if no time is selected or if 12:00 AM is picked
        newEnd.setHours(23, 59, 59, 999);
      } else {
        newEnd.setHours(hours, minutes, 0, 0);
      }
      onChange({ start: value?.start || null, end: newEnd });
      // Removing setIsOpen(false) to allow time selection after date selection
      // setIsOpen(false);
    } else {
      if (!value?.start || (value.start && value.end)) {
        onChange({ start: startOfDay(day), end: null });
        setHoverDate(day);
        setIsSelecting(true);
      } else if (isSelecting) {
        if (day > value.start) {
          onChange({ ...value, end: endOfDay(day) });
        } else {
          onChange({ start: startOfDay(day), end: endOfDay(value.start) });
        }
        setIsSelecting(false);
        setHoverDate(null);
        // Removing setIsOpen(false) to allow time selection after date selection
        // setIsOpen(false);
      }
    }
  };

  const handleMouseEnter = (day: Date) => {
    if (mode === "range" && value?.start && !value.end) {
      setHoverDate(day);
    }
  };

  /* Commented out unused onApply function
  const onApply = () => {
    const parsedStartDate = parse(startDate, "MMM dd, yyyy", new Date());
    const parsedStartTime = parse(startTime || "", "HH:mm", new Date());
    const parsedEndDate = parse(endDate, "MMM dd, yyyy", new Date());
    const parsedEndTime = parse(endTime || "", "HH:mm", new Date());

    if (mode === "start") {
      if (
        parsedStartDate.toString() === "Invalid Date" ||
        parsedStartTime.toString() === "Invalid Date"
      ) {
        setStartDateError(parsedStartDate.toString() === "Invalid Date");
        setStartTimeError(parsedStartTime.toString() === "Invalid Date");
      } else {
        setStartDateError(false);
        setStartTimeError(false);
        const parsedStart = parse(
          `${startDate} ${startTime}`,
          "MMM d, yyyy HH:mm",
          new Date(),
        );
        onChange({
          start: fromZonedTime(parsedStart, selectedTimezone),
          end: value?.end || null,
        });
        setIsOpen(false);
      }
    } else if (mode === "end") {
      if (
        parsedEndDate.toString() === "Invalid Date" ||
        parsedEndTime.toString() === "Invalid Date"
      ) {
        setEndDateError(parsedEndDate.toString() === "Invalid Date");
        setEndTimeError(parsedEndTime.toString() === "Invalid Date");
      } else {
        setEndDateError(false);
        setEndTimeError(false);
        const parsedEnd = parse(
          `${endDate} ${endTime}`,
          "MMM d, yyyy HH:mm",
          new Date(),
        );
        onChange({
          start: value?.start || null,
          end: fromZonedTime(parsedEnd, selectedTimezone),
        });
        setIsOpen(false);
      }
    } else {
      if (
        parsedStartDate.toString() === "Invalid Date" ||
        parsedStartTime.toString() === "Invalid Date" ||
        parsedEndDate.toString() === "Invalid Date" ||
        parsedEndTime.toString() === "Invalid Date"
      ) {
        setStartDateError(parsedStartDate.toString() === "Invalid Date");
        setStartTimeError(parsedStartTime.toString() === "Invalid Date");
        setEndDateError(parsedEndDate.toString() === "Invalid Date");
        setEndTimeError(parsedEndTime.toString() === "Invalid Date");
      } else {
        setStartDateError(false);
        setStartTimeError(false);
        setEndDateError(false);
        setEndTimeError(false);
        const parsedStart = parse(
          `${startDate} ${startTime}`,
          "MMM d, yyyy HH:mm",
          new Date(),
        );
        const parsedEnd = parse(
          `${endDate} ${endTime}`,
          "MMM d, yyyy HH:mm",
          new Date(),
        );
        onChange({
          start: fromZonedTime(parsedStart, selectedTimezone),
          end: fromZonedTime(parsedEnd, selectedTimezone),
        });
        setIsOpen(false);
      }
    }
  };
  */

  useEffect(() => {
    setStartDate(
      value?.start
        ? formatInTimeZone(value.start, selectedTimezone, "MMM dd, yyyy")
        : "",
    );
    setStartTime(
      value?.start
        ? formatInTimeZone(value.start, selectedTimezone, "HH:mm")
        : "",
    );
    setEndDate(
      value?.end
        ? formatInTimeZone(value.end, selectedTimezone, "MMM dd, yyyy")
        : "",
    );
    setEndTime(
      value?.end ? formatInTimeZone(value.end, selectedTimezone, "HH:mm") : "",
    );
  }, [isOpen, value]);

  const parse12To24 = (h: string, m: string, ampm: string) => {
    if (!h || !m || !ampm) return null;
    let hh = parseInt(h);
    const mm = parseInt(m);
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
  };

  const get12Parts = (time24: string) => {
    if (!time24) return { h: "", m: "", ampm: "" };
    const [h24, m] = time24.split(":");
    let h = parseInt(h24);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return { h: h.toString().padStart(2, "0"), m, ampm };
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: (i + 1).toString().padStart(2, "0"),
  }));

  const minuteOptions = [
    { value: "00", label: "00" },
    { value: "30", label: "30" },
  ];

  const ampmOptions = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  return (
    <div className={clsx("relative w-full", isOpen && "z-50")}>
      <div
        className={clsx(
          "w-full",
          presets && "flex",
          presets && stacked && "flex-col",
          compact && "w-[220px]",
        )}
      >
        {presets && (
          <div>
            <CalendarCombobox
              stacked={stacked}
              compact={compact}
              presets={presets}
              value={value}
              onChange={onChange}
              presetIndex={presetIndex}
            />
          </div>
        )}
        <div className="flex items-center w-full">
          <div className="relative w-full">
            <Button
              className={clsx(
                "justify-start! focus:border-transparent! focus:shadow-focus-input! gap-1.5",
                className || "w-full",
                presets && !stacked && !compact && "rounded-l-none -ml-1px!",
                presets && stacked && !compact && "rounded-t-none -mt-1px!",
                presets && compact && "rounded-r-none -mr-1px!",
                // compact ? "w-[180px] gap-1.5" : "w-[230px]",
              )}
              prefix={<CalendarIcon />}
              type="secondary"
              onClick={() => setIsOpen((prevState) => !prevState)}
            >
              <div className="truncate pr-4 text-[12px] text-[#A0AAB5]">
                {mode === "start"
                  ? value?.start
                    ? format(value.start, "MMM dd, yyyy, hh:mm aa")
                    : "Select Start Date"
                  : mode === "end"
                    ? value?.end
                      ? format(value.end, "MMM dd, yyyy, hh:mm aa")
                      : "Select End Date"
                    : value?.start && value?.end
                      ? formatDateRange(
                          value.start,
                          value.end,
                          selectedTimezone,
                        )
                      : "Select Date Range"}
              </div>
            </Button>
            {((mode === "start" && value?.start) ||
              (mode === "end" && value?.end) ||
              (mode === "range" && value?.start && value?.end)) && (
              <Button
                aria-label="Clear input value"
                svgOnly
                variant="unstyled"
                className="absolute right-0 top-1/2 -translate-y-1/2 fill-gray-700 hover:fill-gray-1000"
                onClick={() => {
                  if (mode === "start") {
                    onChange({ start: null, end: value?.end || null });
                  } else if (mode === "end") {
                    onChange({ start: value?.start || null, end: null });
                  } else {
                    onChange(null);
                  }
                }}
              >
                <ClearIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <Material
          ref={calendarRef}
          type="menu"
          className={twMerge(
            clsx(
              "p-3 font-sans absolute top-12 z-10",
              horizontalLayout ? "w-[462px]" : "w-[280px]",
              presets && !stacked && !compact && "left-[250px]",
              presets && stacked && "top-[88px]",
              popoverAlignment === "center" && "left-[125px] -translate-x-1/2",
              popoverAlignment === "end" && "left-[250px] -translate-x-full",
            ),
          )}
        >
          <div className={clsx(horizontalLayout && "flex gap-5")}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm text-gray-1000 font-medium">
                  {formatInTimeZone(currentDate, selectedTimezone, "MMMM yyyy")}
                </h2>
                <div className="flex gap-0.5">
                  <Button variant="unstyled" onClick={prevMonth}>
                    <ArrowLeftIcon />
                  </Button>
                  <Button variant="unstyled" onClick={nextMonth}>
                    <ArrowRightIcon />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-xs text-gray-900 uppercase mb-2">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>
              <div className="grid grid-cols-7 items-center gap-y-2">
                {daysArray.map((day) => {
                  const isStart = value?.start && isSameDay(day, value.start);
                  const isEnd = value?.end && isSameDay(day, value.end);
                  const currentHover =
                    hoverDate && isSelecting && isSameDay(day, hoverDate);
                  const isInRange =
                    value?.start &&
                    ((value.end &&
                      isWithinInterval(day, {
                        start: value.start,
                        end: value.end,
                      })) ||
                      (hoverDate &&
                        isWithinInterval(day, {
                          start: value.start,
                          end: hoverDate,
                        })));
                  const isAllowedDate =
                    (minValue ? day >= minValue : true) &&
                    (maxValue ? day <= maxValue : true);

                  return (
                    <div
                      key={day.toString()}
                      className={clsx(
                        "flex items-center justify-center text-sm text-center rounded transition",
                        isSameMonth(day, currentDate) && isAllowedDate
                          ? "bg-background-100 text-gray-1000"
                          : "bg-background-100 text-gray-700",
                        isInRange &&
                          !isStart &&
                          !isEnd &&
                          !currentHover &&
                          "bg-accents-2! rounded-none",
                        isAllowedDate ? "cursor-pointer" : "cursor-not-allowed",
                      )}
                      onMouseEnter={() =>
                        isAllowedDate && handleMouseEnter(day)
                      }
                      onClick={() => isAllowedDate && handleDateClick(day)}
                    >
                      <div
                        className={clsx(
                          "h-8 w-8 flex items-center justify-center rounded",
                          (isStart || isEnd || currentHover) &&
                            isAllowedDate &&
                            " !bg-gray-1000 !text-background-100",
                          !isStart &&
                            !isEnd &&
                            !currentHover &&
                            !isToday(day) &&
                            isAllowedDate &&
                            "hover:text-gray-1000 hover:border hover:border-gray-alpha-500",
                          currentHover &&
                            isAllowedDate &&
                            " !shadow-focus-calendar-date",
                          isToday(day) && " !bg-blue-900 !text-background-100",
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className={clsx(
                "flex flex-col gap-2",
                horizontalLayout
                  ? "justify-between"
                  : "-mx-3 px-3 pt-2.5 border-t border-gray-alpha-100",
              )}
            >
              <div className="flex flex-col gap-2">
                {mode !== "end" && (
                  <div>
                    {/* <div className="text-[13px] text-gray-900 capitalize">
                      Start
                    </div> */}
                    <div className="flex items-center gap-2">
                      {/* 
                      <div className={showTimeInput ? "col-span-1" : "col-span-2"}>
                        <Input
                          size="small"
                          value={startDate}
                          onChange={(value) => setStartDate(value)}
                          error={startDateError}
                        />
                      </div>
                      */}
                      {showTimeInput && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="flex gap-1 shrink-0">
                            <Select
                              size="xsmall"
                              placeholder="HH"
                              options={hourOptions}
                              value={get12Parts(startTime).h}
                              onChange={(e) => {
                                const { m, ampm } = get12Parts(startTime);
                                const newTime = parse12To24(
                                  e.target.value,
                                  m || "00",
                                  ampm || "AM",
                                );
                                if (newTime) {
                                  setStartTime(newTime);
                                  setManualStartTime(""); // Clear manual input when dropdown is used
                                  const [h, min] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newStart = new Date(
                                    value?.start || new Date(),
                                  );
                                  newStart.setHours(h, min, 0, 0);
                                  onChange({
                                    ...value,
                                    start: newStart,
                                  } as RangeValue);
                                }
                              }}
                            />
                            <Select
                              size="xsmall"
                              placeholder="MM"
                              options={minuteOptions}
                              value={get12Parts(startTime).m}
                              onChange={(e) => {
                                const { h, ampm } = get12Parts(startTime);
                                const newTime = parse12To24(
                                  h || "12",
                                  e.target.value,
                                  ampm || "AM",
                                );
                                if (newTime) {
                                  setStartTime(newTime);
                                  setManualStartTime(""); // Clear manual input when dropdown is used
                                  const [hours, min] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newStart = new Date(
                                    value?.start || new Date(),
                                  );
                                  newStart.setHours(hours, min, 0, 0);
                                  onChange({
                                    ...value,
                                    start: newStart,
                                  } as RangeValue);
                                }
                              }}
                            />
                            <Select
                              size="xsmall"
                              placeholder="AM"
                              options={ampmOptions}
                              value={get12Parts(startTime).ampm}
                              onChange={(e) => {
                                const { h, m } = get12Parts(startTime);
                                const newTime = parse12To24(
                                  h || "12",
                                  m || "00",
                                  e.target.value,
                                );
                                if (newTime) {
                                  setStartTime(newTime);
                                  setManualStartTime(""); // Clear manual input when dropdown is used
                                  const [hours, min] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newStart = new Date(
                                    value?.start || new Date(),
                                  );
                                  newStart.setHours(hours, min, 0, 0);
                                  onChange({
                                    ...value,
                                    start: newStart,
                                  } as RangeValue);
                                }
                              }}
                            />
                          </div>
                          <div className="w-24 shrink-0">
                            <Input
                              size="small"
                              placeholder="Custom"
                              value={manualStartTime}
                              onChange={(val) => {
                                setManualStartTime(val);
                                setStartTime(val);
                                const [hours, minutes] = val
                                  .split(":")
                                  .map(Number);
                                if (!isNaN(hours) && !isNaN(minutes)) {
                                  const newStart = new Date(
                                    value?.start || new Date(),
                                  );
                                  newStart.setHours(hours, minutes, 0, 0);
                                  onChange({
                                    ...value,
                                    start: newStart,
                                  } as RangeValue);
                                }
                              }}
                              error={startTimeError}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {mode !== "start" && (
                  <div>
                    {/* <div className="text-[13px] text-gray-900 capitalize">
                      End
                    </div> */}
                    <div className="flex items-center gap-2">
                      {/* 
                      <div className={showTimeInput ? "col-span-1" : "col-span-2"}>
                        <Input
                          size="small"
                          value={endDate}
                          onChange={(value) => setEndDate(value)}
                          error={endDateError}
                        />
                      </div>
                      */}
                      {showTimeInput && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="flex gap-1 shrink-0">
                            <Select
                              size="xsmall"
                              placeholder="HH"
                              options={hourOptions}
                              value={get12Parts(endTime).h}
                              onChange={(e) => {
                                const { m, ampm } = get12Parts(endTime);
                                const newTime = parse12To24(
                                  e.target.value,
                                  m || "00",
                                  ampm || "AM",
                                );
                                if (newTime) {
                                  setEndTime(newTime);
                                  setManualEndTime("");
                                  const [h, min] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newEnd = new Date(
                                    value?.end || new Date(),
                                  );
                                  if (h === 0 && min === 0) {
                                    newEnd.setHours(23, 59, 59, 999);
                                  } else {
                                    newEnd.setHours(h, min, 0, 0);
                                  }
                                  onChange({
                                    ...value,
                                    end: newEnd,
                                  } as RangeValue);
                                }
                              }}
                            />
                            <Select
                              size="xsmall"
                              placeholder="MM"
                              options={minuteOptions}
                              value={get12Parts(endTime).m}
                              onChange={(e) => {
                                const { h, ampm } = get12Parts(endTime);
                                const newTime = parse12To24(
                                  h || "12",
                                  e.target.value,
                                  ampm || "AM",
                                );
                                if (newTime) {
                                  setEndTime(newTime);
                                  setManualEndTime("");
                                  const [hrs, mins] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newEnd = new Date(
                                    value?.end || new Date(),
                                  );
                                  if (hrs === 0 && mins === 0) {
                                    newEnd.setHours(23, 59, 59, 999);
                                  } else {
                                    newEnd.setHours(hrs, mins, 0, 0);
                                  }
                                  onChange({
                                    ...value,
                                    end: newEnd,
                                  } as RangeValue);
                                }
                              }}
                            />
                            <Select
                              size="xsmall"
                              placeholder="AM"
                              options={ampmOptions}
                              value={get12Parts(endTime).ampm}
                              onChange={(e) => {
                                const { h, m } = get12Parts(endTime);
                                const newTime = parse12To24(
                                  h || "12",
                                  m || "00",
                                  e.target.value,
                                );
                                if (newTime) {
                                  setEndTime(newTime);
                                  setManualEndTime("");
                                  const [hrs, mins] = newTime
                                    .split(":")
                                    .map(Number);
                                  const newEnd = new Date(
                                    value?.end || new Date(),
                                  );
                                  if (hrs === 0 && mins === 0) {
                                    newEnd.setHours(23, 59, 59, 999);
                                  } else {
                                    newEnd.setHours(hrs, mins, 0, 0);
                                  }
                                  onChange({
                                    ...value,
                                    end: newEnd,
                                  } as RangeValue);
                                }
                              }}
                            />
                          </div>
                          <div className="w-20 shrink-0">
                            <Input
                              size="small"
                              placeholder="Custom"
                              value={manualEndTime}
                              onChange={(val) => {
                                setManualEndTime(val);
                                setEndTime(val);
                                const [hours, minutes] = val
                                  .split(":")
                                  .map(Number);
                                if (!isNaN(hours) && !isNaN(minutes)) {
                                  const newEnd = new Date(
                                    value?.end || new Date(),
                                  );
                                  if (hours === 0 && minutes === 0) {
                                    newEnd.setHours(23, 59, 59, 999);
                                  } else {
                                    newEnd.setHours(hours, minutes, 0, 0);
                                  }
                                  onChange({
                                    ...value,
                                    end: newEnd,
                                  } as RangeValue);
                                }
                              }}
                              error={endTimeError}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {/* <div className="font-medium flex flex-col">
                  <Button
                    type="secondary"
                    size="small"
                    suffix={<span className="mt-1 text-xs">↵</span>}
                    onClick={onApply}
                  >
                    Apply
                  </Button>
                </div> */}
                {/* <div className="w-fit self-center">
                  <Select
                    size="xsmall"
                    variant="ghost"
                    options={timezones}
                    value={selectedTimezone}
                    onChange={(event) =>
                      setSelectedTimezone(event.target.value)
                    }
                  />
                </div> */}
              </div>
            </div>
          </div>
        </Material>
      )}
    </div>
  );
};
