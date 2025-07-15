import { DayPicker, DateRange, getDefaultClassNames } from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LifecycleStage } from "types/form";
import { Dictionary } from "types/dictionary";
import { useDictionary } from "hooks/useDictionary";

interface DateRangeInputProps {
  selectedDate: { from?: string; to?: string };
  setSelectedDate: React.Dispatch<
    React.SetStateAction<{ from?: string; to?: string }>
  >;
  lifecycleStage: LifecycleStage;
  dayPickerRef: React.RefObject<HTMLDivElement>;
}

/**
 * @param {object} selectedDate The selected date range object with 'from' and 'to' date strings.
 * @param setSelectedDate A dispatch method to update selected date range.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param dayPickerRef A reference to the DayPicker component for handling clicks outside.
 */

export default function DateRangeInput({
  selectedDate,
  setSelectedDate,
  lifecycleStage,
  dayPickerRef,
}: DateRangeInputProps) {
  const taskId: string = "task date range";
  const dict: Dictionary = useDictionary();
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const defaultDayPickerClassNames = getDefaultClassNames();

  const dayPickerSelectedRange: DateRange = {
    from: selectedDate?.from ? new Date(selectedDate.from) : undefined,
    to: selectedDate?.to ? new Date(selectedDate.to) : undefined,
  };

  // Format Date to 'YYYY-MM-DD' string
  const formatDateToYYYYMMDD = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      throw new Error("Invalid date provided");
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      setSelectedDate({
        from: range?.from ? formatDateToYYYYMMDD(range.from) : undefined,
        to: range?.to ? formatDateToYYYYMMDD(range.to) : undefined,
      });
    },
    [setSelectedDate]
  );

  // Close DayPicker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dayPickerRef.current &&
        !dayPickerRef.current.contains(event.target as Node)
      ) {
        setIsDayPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayedDateRange = useMemo(() => {
    return selectedDate.from
      ? selectedDate.to
        ? `${formatDateToYYYYMMDD(
            new Date(selectedDate.from)
          )} - ${formatDateToYYYYMMDD(new Date(selectedDate.to))}`
        : formatDateToYYYYMMDD(new Date(selectedDate.from)) // If only 'from' is selected
      : "";
  }, [selectedDate]);

  const getDisabledDates = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (lifecycleStage === "scheduled") {
      return { before: tomorrow }; // Disable today and all dates before today (only allow future dates)
    }
  }, [lifecycleStage]);

  return (
    <div className="flex items-center gap-4 relative">
      <label
        className="my-1 text-sm md:text-lg text-left whitespace-nowrap"
        htmlFor={taskId}
      >
        {dict.action.date}:
      </label>
      <input
        id={taskId}
        type="text"
        value={displayedDateRange}
        readOnly
        onClick={() => setIsDayPickerOpen(!isDayPickerOpen)}
        className={`h-8 ${
          selectedDate?.to ? "w-60" : "w-32"
        } p-4 rounded-lg border-1 border-border bg-muted text-foreground shadow-md cursor-pointer`}
        aria-label={taskId}
        aria-expanded={isDayPickerOpen}
      />
      {isDayPickerOpen && (
        <div className="absolute z-10 bg-muted p-2 rounded-lg shadow-lg top-full mt-2 border border-border">
          <DayPicker
            locale={window.navigator.language.startsWith("de") ? de : enGB}
            mode="range"
            selected={dayPickerSelectedRange}
            onSelect={handleDateSelect}
            disabled={getDisabledDates}
            aria-label={taskId}
            classNames={{
              today: `text-blue-700 `,
              selected: `bg-gray-200 dark:bg-zinc-800`,
              root: `${defaultDayPickerClassNames.root}  p-4`,
              chevron: ` fill-foreground`,
              footer: `mt-4 font-bold text-foreground flex justify-center items-center`,
              range_middle: ` `,
              range_start: `!bg-primary text-foreground rounded-full`,
              range_end: `!bg-primary text-foreground rounded-full`,
            }}
            footer={
              displayedDateRange
                ? displayedDateRange
                : dict.message.noDateSelected
            }
          />
        </div>
      )}
    </div>
  );
}
