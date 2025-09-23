import "react-day-picker/style.css";

import {
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
  selectedDate: Date | DateRange;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedDateRange?: React.Dispatch<React.SetStateAction<DateRange>>;
  placement?: Placement;
  disabledDates?: DateBefore;
  disabled?: boolean;
  disableMobileView?: boolean;
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
 */
export default function DateInput(props: Readonly<DateInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();
  const screenType: ScreenType = useScreenType();
  const isDateType: boolean = props.selectedDate instanceof Date;
  const defaultDayPickerClassNames = getDefaultClassNames();

  const extractDateDisplay = (targetDate: Date | DateRange) => {
    if (isDateType) {
      return getNormalizedDate(targetDate as Date);
    }
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

  const handleDateSelect = (date: DateRange | Date) => {
    if (isDateType) {
      props.setSelectedDate(date as Date);
    } else {
      props.setSelectedDateRange({
        from: (date as DateRange)?.from ?? undefined,
        to: (date as DateRange)?.to ?? undefined,
      });
    }
  };

  useEffect(() => {
    setDisplayedDateValues(extractDateDisplay(props.selectedDate));
  }, [props.selectedDate]);

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
              fontSize={isDateType ? "small" : "medium"}
              className={`material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDateType
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
                isDateType
                  ? `h-[43.5px] w-full pr-10 pl-4 rounded-lg bg-muted border border-border text-foreground text-left ${
                      props.disabled ? "cursor-not-allowed opacity-75" : ""
                    }`
                  : `h-10  ${
                      (props.selectedDate as DateRange)?.to
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
              {!isDateType && (
                <DayPicker
                  locale={dict.lang === "de" ? de : enGB}
                  mode="range"
                  selected={props.selectedDate as DateRange}
                  onSelect={handleDateSelect}
                  disabled={props.disabledDates}
                  classNames={{
                    today: `text-yellow-500`,
                    selected: `bg-gray-200 dark:bg-zinc-800`,
                    root: `${defaultDayPickerClassNames.root}  p-4`,
                    chevron: ` fill-foreground`,
                    footer: `mt-4 font-bold text-foreground flex justify-center items-center`,
                    range_middle: ` `,
                    range_start: `!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full`,
                    range_end: `!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full`,
                  }}
                  required={true}
                />
              )}
              {isDateType && !props.disabled && (
                <DayPicker
                  locale={dict.lang === "de" ? de : enGB}
                  mode="single"
                  selected={props.selectedDate as Date}
                  onSelect={handleDateSelect}
                  disabled={props.disabledDates}
                  classNames={{
                    today: `text-yellow-500`,
                    selected: `!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full`,
                    root: `${defaultDayPickerClassNames.root}  p-4`,
                    chevron: ` fill-foreground`,
                  }}
                  required={true}
                />
              )}
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
