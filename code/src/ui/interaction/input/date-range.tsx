import "react-day-picker/style.css";

import {
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { useDictionary } from "hooks/useDictionary";
import { useScreenType } from "hooks/useScreenType";
import { useId, useState } from "react";
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
import { getInitialDate } from "utils/client-utils";
import { Icon } from "@mui/material";

interface DateRangeInputProps {
  selectedDate?: DateRange | Date;
  setSelectedDate?: React.Dispatch<React.SetStateAction<DateRange | Date>>;
  placement?: Placement;
  disabled?: DateBefore;
  disableMobileView?: boolean;
  isDateRange?: boolean;
}

/** A component to display a date range input
 *
 * @param {DateRange} selectedDate An optional controlled selected date range.
 * @param setSelectedDate An optional controlled dispatch method to update selected date range.
 * @param {Placement} placement Optional placement position for the calendar view.
 * @param {DateBefore} disabled Optional dates to be disabled.
 * @param {boolean} disableMobileView An override property to disable the mobile view if set. Do not set this if the component is intended to be dynamically rendered.
 */
export default function DateRangeInput(props: Readonly<DateRangeInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();

  const defaultDayPickerClassNames = getDefaultClassNames();
  const currentDate: Date = new Date();

  const popover = usePopover(props.placement);
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

  const screenType: ScreenType = useScreenType();
  const [selectedDate, setSelectedDate] = useState<DateRange | Date>(
    props.selectedDate
      ? props.isDateRange
        ? getInitialDate()
        : props.selectedDate
      : currentDate
  );

  const handleDateSelect = (date: DateRange | Date) => {
    const dateRange: DateRange = {
      from: (date as DateRange)?.from ?? undefined,
      to: (date as DateRange)?.to ?? undefined,
    };
    if (props.isDateRange) {
      setSelectedDate(dateRange);
      if (props.setSelectedDate) {
        props.setSelectedDate(dateRange);
      }
    } else {
      setSelectedDate(date as Date);
      if (props.setSelectedDate) {
        props.setSelectedDate(date as Date);
      }
    }
  };

  const displayedDateRange: string = props.isDateRange
    ? (selectedDate as DateRange).from
      ? `${(selectedDate as DateRange).from.toLocaleDateString()}${
          (selectedDate as DateRange).to &&
          (selectedDate as DateRange).from !== (selectedDate as DateRange).to
            ? " - " + (selectedDate as DateRange).to.toLocaleDateString()
            : ""
        }`
      : ""
    : (selectedDate as Date).toLocaleDateString();

  const dateRangeStyles = `h-10  ${
    (selectedDate as DateRange)?.to ? "w-62 pr-10 pl-4" : "w-24 "
  }  rounded-lg bg-blue-50 dark:bg-background dark:text-blue-400  dark:border-blue-400 border border-blue-200 text-blue-700 shadow-xs cursor-pointer`;

  const singleDateStyles = `h-[43.5px] w-full pr-10 pl-4 rounded-lg bg-muted border border-border text-foreground text-left`;

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
              fontSize={props.isDateRange ? "medium" : "small"}
              className={`material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 ${
                props.isDateRange
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-foreground"
              }  pointer-events-none`}
            >
              calendar_month
            </Icon>
            <input
              id={id}
              type="button"
              value={displayedDateRange}
              readOnly
              className={props.isDateRange ? dateRangeStyles : singleDateStyles}
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
              className="z-10 bg-muted p-5 sm:p-2 md:ml-4 lg:ml-12 rounded-lg shadow-lg mt-2  border border-border"
            >
              {props.isDateRange ? (
                <DayPicker
                  locale={dict.lang === "de" ? de : enGB}
                  mode="range"
                  selected={selectedDate as DateRange}
                  onSelect={handleDateSelect}
                  disabled={props.disabled}
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
                  footer={displayedDateRange}
                  required={true}
                />
              ) : (
                <DayPicker
                  locale={dict.lang === "de" ? de : enGB}
                  mode="single"
                  selected={selectedDate as Date}
                  onSelect={handleDateSelect}
                  disabled={props.disabled}
                  classNames={{
                    today: `text-yellow-500`,
                    selected: `!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full`,
                    root: `${defaultDayPickerClassNames.root}  p-4`,
                    chevron: ` fill-foreground`,
                    footer: `mt-4 font-bold text-foreground flex justify-center items-center`,
                  }}
                  footer={displayedDateRange}
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
