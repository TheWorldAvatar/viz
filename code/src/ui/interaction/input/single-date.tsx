import "react-day-picker/style.css";

import {
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { useDictionary } from "hooks/useDictionary";
import { useCallback, useId, useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import { Dictionary } from "types/dictionary";
import { Icon } from "@mui/material";

interface SingleDatePickerProps {
  selectedDate?: Date | undefined;
  setSelectedDate?: (_date: Date | undefined) => void;
  placement?: Placement;
}

/** A component to display a single date input
 *
 * @param {Date} selectedDate An optional controlled selected date.
 * @param setSelectedDate An optional controlled  method to update selected date.
 * @param {Placement} placement Optional placement position for the calendar view.
 */

export default function SingleDatePicker(
  props: Readonly<SingleDatePickerProps>
) {
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    props.selectedDate ?? currentDate
  );

  const handleSingleSelect = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      if (props.setSelectedDate) props.setSelectedDate(date);
    },
    [selectedDate, props.setSelectedDate]
  );

  const displayedValue = useMemo(
    () => (selectedDate ? selectedDate.toLocaleDateString() : ""),
    [selectedDate]
  );

  return (
    <div className="relative  w-full">
      <div className="flex w-full" ref={popover.refs.setReference}>
        <Icon className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400  pointer-events-none">
          calendar_month
        </Icon>
        <input
          id={id}
          type="button"
          value={displayedValue}
          readOnly
          className={`h-[43.5px] w-full rounded-lg bg-blue-50 dark:bg-background dark:text-blue-400  dark:border-blue-400 border border-blue-200 text-blue-700 shadow-xs cursor-pointer`}
          {...popover.getReferenceProps()}
        />
      </div>

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
              style={{ ...transition.styles }}
              className="z-10 bg-muted p-5 sm:p-2 rounded-lg shadow-lg mt-2 border border-border"
            >
              <DayPicker
                locale={dict.lang === "de" ? de : enGB}
                mode="single"
                selected={selectedDate}
                onSelect={handleSingleSelect}
                classNames={{
                  today: `text-yellow-500`,
                  selected: `!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full`,
                  root: `${defaultDayPickerClassNames.root}  p-4`,
                  chevron: ` fill-foreground`,
                  footer: `mt-4 font-bold text-foreground flex justify-center items-center`,
                }}
                footer={displayedValue}
                required={true}
              />
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
