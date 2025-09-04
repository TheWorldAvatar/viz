import "react-day-picker/style.css";

import {
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { useDictionary } from "hooks/useDictionary";
import { useScreenType } from "hooks/useScreenType";
import { useCallback, useId, useState } from "react";
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
  selectedDate?: DateRange;
  setSelectedDate?: React.Dispatch<React.SetStateAction<DateRange>>;
  placement?: Placement;
  disabled?: DateBefore;
}

/** A component to display a date range input
 *
 * @param {DateRange} selectedDate An optional controlled selected date range.
 * @param setSelectedDate An optional controlled dispatch method to update selected date range.
 * @param {Placement} placement Optional placement position for the calendar view.
 * @param {DateBefore} disabled Optional dates to be disabled.
 */
export default function DateRangeInput(props: Readonly<DateRangeInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();

  const defaultDayPickerClassNames = getDefaultClassNames();

  const popover = usePopover(props.placement);
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

  const screenType: ScreenType = useScreenType();
  const [selectedDate, setSelectedDate] = useState<DateRange>(
    props.selectedDate ?? getInitialDate()
  );

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      const dateRange: DateRange = {
        from: range?.from ?? undefined,
        to: range?.to ?? undefined,
      };
      setSelectedDate(dateRange);
      if (props.setSelectedDate) {
        props.setSelectedDate(dateRange);
      }
    },
    [setSelectedDate, props.setSelectedDate]
  );

  const displayedDateRange = `${selectedDate.from.toLocaleDateString()}${
    selectedDate.from != selectedDate.to
      ? " - " + selectedDate.to.toLocaleDateString()
      : ""
  }`;

  return (
    <div
      ref={popover.refs.setReference}
      className="flex items-center gap-2 relative"
    >
      {screenType === "mobile" ? (
        <Button
          id={`${id}-mobile`}
          type="button"
          size="icon"
          variant="outline"
          leftIcon="date_range"
          tooltipText={dict.action.date}
          {...popover.getReferenceProps()}
        />
      ) : (
        <div className="flex items-center">
          <div className="relative">
            <input
              id={id}
              type="button"
              value={displayedDateRange}
              readOnly
              className={`h-10 ${
                selectedDate?.to ? "w-62 pl-10 pr-4" : "w-24 "
              }  rounded-lg bg-blue-50 dark:bg-background dark:text-blue-400  dark:border-blue-400 border border-blue-200 text-blue-700 shadow-xs cursor-pointer`}
              {...popover.getReferenceProps()}
            />
            <Icon className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400  pointer-events-none">
              calendar_month
            </Icon>
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
              <DayPicker
                locale={dict.lang === "de" ? de : enGB}
                mode="range"
                selected={selectedDate}
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
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
