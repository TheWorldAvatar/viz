import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";
import Checkbox from "ui/interaction/input/checkbox";
import DateInput from "ui/interaction/input/date/date-input";
import { getNormalizedDate, interpolate } from "utils/client-utils";

interface DateColumnFilterProps {
  label: string;
  currentVal: string;
  onSubmission: (_dates: string) => void;
}

/**
 * A column filter component to filter the table by date.
 *
 * @param {string} label The name of the column.
 * @param {string} currentVal The current value stored in the table filters.
 * @param {void} onSubmission Function that submits the filtered date range.
 */
export default function DateColumnFilter(props: Readonly<DateColumnFilterProps>) {
  const dict: Dictionary = useDictionary();
  const [from, to]: string[] = props.currentVal ? props.currentVal?.split("..") : [];

  const [isOptional, setIsOptional] = useState<boolean>(props.currentVal?.includes("null"));
  const [selectedDate, setSelectedDate] = useState<DateRange>(props.currentVal && props.currentVal != "null" ?
    { from: new Date(from), to: new Date(to) } : undefined);

  return (
    <div className="flex flex-col gap-y-1.5">
      <div className="flex">
        <DateInput
          mode="range"
          ariaLabel={interpolate(dict.message.pickDateRangeFor, props.label)}
          selectedDate={selectedDate}
          setSelectedDateRange={setSelectedDate}
        />
        <Button
          leftIcon="filter_alt"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            let input: string = selectedDate ? `${getNormalizedDate(selectedDate.from)}..${getNormalizedDate(selectedDate.to)}` : "";
            if (isOptional) {
              input = input ? `${input}..null` : "null";
            }
            props.onSubmission(input);
          }}
          tooltipText={dict.action.applyFilter}
          variant="primary"
          className="h-full rounded-none w-12"
          aria-label={interpolate(dict.action.filterBy, props.label)}
        />
        <Button
          leftIcon="filter_list_off"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            props.onSubmission("");
          }}
          tooltipText={dict.action.clearFilter}
          variant="destructive"
          disabled={!selectedDate}
          className="h-full rounded-l-none w-12"
          aria-label={interpolate(dict.action.clearFilterFor, props.label)}
        />
      </div>
      <Checkbox
        label={dict.form.includeBlanks}
        aria-label={dict.form.includeBlanks}
        className="cursor-pointer"
        checked={isOptional}
        handleChange={(checked) => {
          setIsOptional(checked);
        }}
      />
    </div>
  );
}