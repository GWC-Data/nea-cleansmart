import { useState } from "react";
import { Calendar, type RangeValue } from "./calendar";
import { endOfDay, startOfDay, subDays, subMonths, subWeeks } from "date-fns";

const presets = {
  "last-3-days": {
    text: "Last 3 Days",
    start: startOfDay(subDays(new Date(), 3)),
    end: endOfDay(new Date())
  },
  "last-7-days": {
    text: "Last 7 Days",
    start: startOfDay(subWeeks(new Date(), 1)),
    end: endOfDay(new Date())
  },
  "last-14-days": {
    text: "Last 14 Days",
    start: startOfDay(subWeeks(new Date(), 2)),
    end: endOfDay(new Date())
  },
  "last-month": {
    text: "Last Month",
    start: startOfDay(subMonths(new Date(), 1)),
    end: endOfDay(new Date())
  }
};

export default function StackedDemo() {
  const [date5, setDate5] = useState<RangeValue | null>(null);
  return (
    <div className="self-start pt-30">
      <Calendar
          isDocsPage
          onChange={setDate5}
          presets={presets}
          stacked
          value={date5}
        />
    </div>
  );
}
