import "react-day-picker/style.css";

import { FloatingPortal, useTransitionStyles } from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { useDictionary } from "hooks/useDictionary";
import { useCallback, useId } from "react";
import {
  DateBefore,
  DateRange,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import { Dictionary } from "types/dictionary";
import { LifecycleStage } from "types/form";

interface DateRangeInputProps {
  selectedDate: DateRange;
  setSelectedDate: React.Dispatch<React.SetStateAction<DateRange>>;
  lifecycleStage: LifecycleStage;
}

/** A component to display a date range input
 *
 * @param {DateRange} selectedDate The selected date range.
 * @param setSelectedDate A dispatch method to update selected date range.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 */
export default function DateRangeInput(props: Readonly<DateRangeInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();

  const defaultDayPickerClassNames = getDefaultClassNames();

  const popover = usePopover();
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      props.setSelectedDate({
        from: range?.from ?? undefined,
        to: range?.to ?? undefined,
      });
    },
    [props.setSelectedDate]
  );

  const displayedDateRange = `${props.selectedDate.from.toLocaleDateString()}${
    props.selectedDate.from != props.selectedDate.to
      ? " - " + props.selectedDate.to.toLocaleDateString()
      : ""
  }`;

  return (
    <div className="flex items-center gap-4 relative">
      <label
        className="my-1 text-sm md:text-lg text-left whitespace-nowrap"
        htmlFor={id}
      >
        {dict.action.date}:
      </label>
      <input
        ref={popover.refs.setReference}
        {...popover.getReferenceProps()}
        id={id}
        type="button"
        value={displayedDateRange}
        readOnly
        className={`h-10 ${
          props.selectedDate?.to ? "w-60" : "w-32"
        } rounded-lg border-1 border-border bg-muted text-foreground shadow-xs cursor-pointer`}
      />
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
              className="z-10 bg-muted p-5 sm:p-2 rounded-lg shadow-lg mt-2  border border-border"
            >
              <DayPicker
                locale={dict.lang === "de" ? de : enGB}
                mode="range"
                selected={props.selectedDate}
                onSelect={handleDateSelect}
                disabled={getDisabledDates(props.lifecycleStage)}
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

/**
 * Function to get disabled date range based on lifecycle stage.
 *
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 */
function getDisabledDates(lifecycleStage: LifecycleStage): DateBefore {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  // For scheduled stage, only dates from tomorrow onwards should be available
  // and previous days should be disabled
  if (lifecycleStage === "scheduled") {
    return { before: tomorrow };
  }
  return undefined;
}
