import "react-day-picker/style.css";

import {
  FloatingFocusManager,
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { Icon } from "@mui/material";
import { usePopover } from "hooks/float/usePopover";
import { useDictionary } from "hooks/useDictionary";
import { useScreenType } from "hooks/useScreenType";
import { useEffect, useId, useState } from "react";
import {
  ClassNames,
  DateBefore,
  DateRange,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import { Dictionary } from "types/dictionary";
import { ScreenType } from "types/settings";
import Button from "ui/interaction/button";
import { getNormalizedDate } from "utils/client-utils";

interface DateInputProps {
  selectedDate: Date | DateRange | Date[];
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedDateRange?: React.Dispatch<React.SetStateAction<DateRange>>;
  setSelectedDates?: React.Dispatch<React.SetStateAction<Date[]>>;
  placement?: Placement;
  disabledDates?: DateBefore;
  disabled?: boolean;
  disableMobileView?: boolean;
  mode: "single" | "range" | "multiple";
}

/** A component to display a date range input
 *
 * @param {Date | DateRange} selectedDate A controlled selected date range.
 * @param setSelectedDate An optional controlled dispatch method to update selected date.
 * @param setSelectedDateRange An optional controlled dispatch method to update selected date range.
 * @param {Placement} placement Optional placement position for the calendar view.
 * @param {DateBefore} disabledDates Optional dates to be disabled.
 * @param {boolean} disabled Disabled the input if true.
 * @param {boolean} disableMobileView An override property to disable the mobile view if set. Do not set this if the component is intended to be dynamically rendered.
 * @param {"single" | "range" | "multiple"} mode The mode of the date input, either single date, date range or multiple dates.
 */
export default function DateInput(props: Readonly<DateInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();
  const screenType: ScreenType = useScreenType();
  const defaultDayPickerClassNames: ClassNames = getDefaultClassNames();

  const extractDateDisplay = (targetDate: Date | DateRange | Date[]): string => {
    if (props.mode === "single") {
      return getNormalizedDate(targetDate as Date);
    }
    if (props.mode === "multiple") {
      const dates: Date[] = targetDate as Date[];
      if (!Array.isArray(dates) || dates.length === 0) return "";
      const sortedDates: Date[] = [...dates].sort((a, b) => a.getTime() - b.getTime());
      const first: string = sortedDates[0].toLocaleDateString();
      const last: string = sortedDates.at(-1).toLocaleDateString();
      return dates.length === 1 ? first : `${first} - ${last}`;
    }
    // range mode
    const targetDateRange: DateRange = targetDate as DateRange;
    const fromDate: string = targetDateRange?.from?.toLocaleDateString();
    const toDate: string = targetDateRange?.to?.toLocaleDateString();
    return `${fromDate}${fromDate != toDate ? " - " + toDate : ""}`;
  };
  const [displayedDateValues, setDisplayedDateValues] = useState<string>(
    extractDateDisplay(props.selectedDate)
  );

  const popover = usePopover(props.placement);
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

  const handleDateSelect = (date: Date | DateRange | Date[]) => {
    if (props.mode === "single") {
      props.setSelectedDate?.(date as Date);
    } else if (props.mode === "multiple") {
      props.setSelectedDates?.(date as Date[]);
    } else {
      props.setSelectedDateRange?.({
        from: (date as DateRange)?.from ?? undefined,
        to: (date as DateRange)?.to ?? undefined,
      });
    }
  };

  useEffect(() => {
    setDisplayedDateValues(extractDateDisplay(props.selectedDate));
  }, [props.selectedDate]);


  const dayPickerClassNames: Partial<ClassNames> = {
    today: "text-yellow-500",
    selected: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
    root: `${defaultDayPickerClassNames.root} p-4`,
    chevron: "fill-foreground",
  };

  return (
    <div
      ref={popover.refs.setReference}
      className="flex items-center gap-2 relative"
    >
      {!props.disableMobileView && screenType === "mobile" && (
        <Button
          id={`${id}-mobile`}
          type="button"
          size="icon"
          variant="outline"
          leftIcon="date_range"
          tooltipText={dict.action.date}
          {...popover.getReferenceProps()}
        />
      )}
      {(props.disableMobileView || screenType != "mobile") && (
        <div className="flex items-center w-full">
          <div className="relative w-full">
            <Icon
              fontSize={props.mode === "single" || props.mode === "multiple" ? "small" : "medium"}
              className={`material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 ${props.mode === "single" || props.mode === "multiple"
                ? "text-foreground"
                : "text-blue-600 dark:text-blue-400"
                }  pointer-events-none`}
            >
              calendar_month
            </Icon>
            <input
              id={id}
              type="button"
              value={displayedDateValues}
              readOnly
              className={
                props.mode === "single" || props.mode === "multiple"
                  ? `h-[43.5px] w-full pr-10 pl-4 rounded-lg bg-muted border border-border text-foreground text-left ${props.disabled
                    ? props.mode === "multiple"
                      ? "opacity-75"
                      : "cursor-not-allowed opacity-75"
                    : ""
                  }`
                  : `h-10  ${(props.selectedDate as DateRange)?.to
                    ? "w-62 pr-10 pl-4"
                    : "w-24"
                  }  rounded-lg bg-blue-50 dark:bg-background dark:text-blue-400  dark:border-blue-400 border border-blue-200 text-blue-700 shadow-xs cursor-pointer`
              }
              {...popover.getReferenceProps()}
            />
          </div>
        </div>
      )}

      {popover.isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={popover.context} modal={false}>
            <div
              ref={popover.refs.setFloating}
              style={{
                ...popover.floatingStyles,
                zIndex: 99999,
              }}
              {...popover.getFloatingProps()}
            >
              <div
                style={{
                  ...transition.styles,
                }}
                className="z-10 bg-muted ml-4 rounded-lg shadow-md border border-border"
              >
                {props.mode === "range" && (
                  <DayPicker
                    locale={dict.lang === "de" ? de : enGB}
                    mode="range"
                    selected={props.selectedDate as DateRange}
                    onSelect={handleDateSelect}
                    disabled={props.disabledDates}
                    classNames={{
                      ...dayPickerClassNames,
                      selected: "bg-gray-200 dark:bg-zinc-800",
                      // range_middle is an empty string to override default styles (required)
                      range_middle: "",
                      range_start: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
                      range_end: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
                    }}
                    required={true}
                  />
                )}
                {props.mode === "multiple" && (
                  <DayPicker
                    locale={dict.lang === "de" ? de : enGB}
                    mode="multiple"
                    selected={props.selectedDate as Date[]}
                    onSelect={handleDateSelect}
                    disabled={props.disabledDates || props.disabled}
                    classNames={dayPickerClassNames}
                    required={true}
                  />
                )}
                {props.mode === "single" && !props.disabled && (
                  <DayPicker
                    locale={dict.lang === "de" ? de : enGB}
                    mode="single"
                    selected={props.selectedDate as Date}
                    onSelect={handleDateSelect}
                    disabled={props.disabledDates}
                    classNames={dayPickerClassNames}
                    required={true}
                  />
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
