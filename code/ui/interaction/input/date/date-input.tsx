import "react-day-picker/style.css";

import { useDictionary } from "@/hooks/useDictionary";
import { useScreenType } from "@/hooks/useScreenType";
import { Dictionary } from "@/types/dictionary";
import { ScreenType, ScreenTypeMap } from "@/types/settings";
import Button, { ButtonVariant } from "@/ui/interaction/button";
import { extractDateDisplay, interpolate } from "@/utils/client-utils";
import {
  Placement
} from "@floating-ui/react";
import React, { useId } from "react";
import {
  ClassNames,
  DateBefore,
  DateRange,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";
import { de, enGB } from "react-day-picker/locale";
import PopoverActionButton from "../../action/popover/popover-button";
import CustomMonthsDropdown from "./custom-months-dropdown";
import CustomYearsDropdown from "./custom-years-dropdown";

interface DateInputProps {
  selectedDate: Date | DateRange | Date[] | undefined;
  mode: "single" | "range" | "multiple";
  ariaLabel: string;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setSelectedDateRange?: React.Dispatch<React.SetStateAction<DateRange>>;
  setSelectedDates?: React.Dispatch<React.SetStateAction<Date[]>>;
  placement?: Placement;
  variant?: ButtonVariant;
  disabledDates?: DateBefore;
  className?: string;
  disabled?: boolean;
  disableMobileView?: boolean;
  inline?: boolean;
  required?: boolean;
  children?: React.ReactNode;
}

/** A component to display a date range input
 *
 * @param {Date | DateRange} selectedDate A controlled selected date range.
 * @param {"single" | "range" | "multiple"} mode The mode of the date input, either single date, date range or multiple dates.
 * @param {string} ariaLabel The field name for aria-label.
 * @param setSelectedDate An optional controlled dispatch method to update selected date.
 * @param setSelectedDateRange An optional controlled dispatch method to update selected date range.
 * @param {Placement} placement Optional placement position for the calendar view.
 * @param {ButtonVariant} variant Optional variant to default to.
 * @param {DateBefore} disabledDates Optional dates to be disabled.
 * @param {boolean} disabled Disabled the input if true.
 * @param {boolean} disableMobileView An override property to disable the mobile view if set. Do not set this if the component is intended to be dynamically rendered.
 * @param {boolean} inline Indicates if the date selection UI is inline with the current DOM element.
 * @param {boolean} required Whether the date input is required or not. Only applicable in single date mode.
 */
export default function DateInput(props: Readonly<DateInputProps>) {
  const id: string = useId();
  const dict: Dictionary = useDictionary();
  const screenType: ScreenType = useScreenType();
  const displayedDateValues: string = extractDateDisplay(props.selectedDate, props.mode);
  const arialDescriptionId: string = `${props.ariaLabel}-current-value`;

  const showMobileView: boolean = !props.disableMobileView && screenType === ScreenTypeMap.MOBILE;

  if (props.inline) {
    return <section className="flex flex-col">
      <div className="flex pr-1">
        <Button
          id={id}
          leftIcon="date_range"
          size={showMobileView ? "icon" : "sm"}
          className={"flex-4 justify-start"}
          // Defaults variant to outline if not provided and in mobile view mode
          variant={!showMobileView && !!props.variant ? props.variant : "outline"}
          label={showMobileView && !!displayedDateValues ? "" : displayedDateValues}
          tooltipText={dict.action.date}
          onClick={(e) => {
            // Prevent click effects when disabled
            e.preventDefault();
          }}
          aria-label={interpolate(dict.message.pickDateRangeFor, `${props.ariaLabel}: ${displayedDateValues}`)}
          aria-describedby={arialDescriptionId}
          disabled={props.disabled}
        />
        {props.children}
      </div>

      <DateSelectionInput
        {...props}
        className="px-2 py-1"
      />
    </section>
  }
  return <PopoverActionButton
    id={id}
    leftIcon="date_range"
    placement={props.placement ?? "bottom"}
    size={showMobileView ? "icon" : "sm"}
    className={"h-full w-full p-2 justify-start"}
    // Defaults variant to outline if not provided and in mobile view mode
    variant={!showMobileView && !!props.variant ? props.variant : "outline"}
    label={showMobileView && !!displayedDateValues ? "" : displayedDateValues}
    tooltipText={dict.action.date}
    onClick={(e) => {
      // Prevent click effects when disabled
      e.preventDefault();
    }}
    aria-label={interpolate(dict.message.pickDateRangeFor, `${props.ariaLabel}: ${displayedDateValues}`)}
    aria-describedby={arialDescriptionId}
    disabled={props.disabled}
  >
    <DateSelectionInput
      {...props}
      className="py-2 px-4"
    />
  </PopoverActionButton>
}

function DateSelectionInput(props: Readonly<DateInputProps>) {
  const dict: Dictionary = useDictionary();
  const defaultDayPickerClassNames: ClassNames = getDefaultClassNames();

  const handleDateSelect = (date: Date | DateRange | Date[]) => {
    if (props.mode === "single") {
      props.setSelectedDate?.(date as Date | undefined);
    } else if (props.mode === "multiple") {
      props.setSelectedDates?.(date as Date[]);
    } else {
      props.setSelectedDateRange?.({
        from: (date as DateRange)?.from ?? undefined,
        to: (date as DateRange)?.to ?? undefined,
      });
    }
  };

  const dayPickerClassNames: Partial<ClassNames> = {
    today: "text-yellow-500",
    selected: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
    root: `${defaultDayPickerClassNames.root} ${props.className}`,
    chevron: "fill-foreground",
  };

  if (props.mode === "range") {
    return <DayPicker
      locale={dict.lang === "de" ? de : enGB}
      mode="range"
      selected={props.selectedDate as DateRange}
      onSelect={handleDateSelect}
      disabled={props.disabledDates}
      captionLayout="dropdown"
      startMonth={new Date(new Date().getFullYear() - 500, 0)}
      endMonth={new Date(new Date().getFullYear() + 500, 11)}
      classNames={{
        ...dayPickerClassNames,
        selected: "bg-gray-200 dark:bg-zinc-800",
        // range_middle is an empty string to override default styles (required)
        range_middle: "",
        range_start: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
        range_end: "!bg-blue-600 dark:!bg-blue-700 text-blue-50 rounded-full",
      }}
      required={true}
      components={{
        YearsDropdown: CustomYearsDropdown,
        MonthsDropdown: CustomMonthsDropdown,
      }}
    />
  } else if (props.mode === "multiple") {
    return <DayPicker
      locale={dict.lang === "de" ? de : enGB}
      mode="multiple"
      captionLayout="dropdown"
      startMonth={new Date(new Date().getFullYear() - 500, 0)}
      endMonth={new Date(new Date().getFullYear() + 500, 11)}
      selected={props.selectedDate as Date[]}
      onSelect={handleDateSelect}
      disabled={props.disabledDates || props.disabled}
      classNames={dayPickerClassNames}
      required={true}
      components={{
        YearsDropdown: CustomYearsDropdown,
        MonthsDropdown: CustomMonthsDropdown,
      }}
    />
  } else if (props.mode === "single") {
    return <DayPicker
      locale={dict.lang === "de" ? de : enGB}
      mode="single"
      captionLayout="dropdown"
      startMonth={new Date(new Date().getFullYear() - 500, 0)}
      endMonth={new Date(new Date().getFullYear() + 500, 11)}
      selected={props.selectedDate as Date | undefined}
      onSelect={handleDateSelect}
      disabled={props.disabledDates}
      classNames={dayPickerClassNames}
      required={props.required ?? true}
      components={{
        YearsDropdown: CustomYearsDropdown,
        MonthsDropdown: CustomMonthsDropdown,
      }}
    />
  }
  return;
}