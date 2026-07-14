import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import Button from "@/ui/interaction/button";
import DateInput from "@/ui/interaction/input/date/date-input";
import { getNormalizedDate, interpolate } from "@/utils/client-utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface DateColumnFilterProps {
  label: string;
  currentVal: string;
  onSubmission: (_dates: string[]) => void;
  disabled?: boolean;
}

/**
 * A column filter component to filter the table by date.
 *
 * @param {string} label The name of the column.
 * @param {string} currentVal The current value stored in the table filters.
 * @param {void} onSubmission Function that submits the filtered date range.
 * @param {boolean} disabled An optional state to disable the filter.
 */
export default function DateColumnFilter(props: Readonly<DateColumnFilterProps>) {
  const dict: Dictionary = useDictionary();
  const [from, to]: string[] = props.currentVal ? props.currentVal?.split("..") : [];
  const [selectedDate, setSelectedDate] = useState<DateRange>(props.currentVal ?
    { from: new Date(from), to: new Date(to) } : undefined);

  return (
    <DateInput
      mode="range"
      variant="info_banner"
      ariaLabel={interpolate(dict.message.pickDateRangeFor, props.label)}
      selectedDate={selectedDate}
      setSelectedDateRange={setSelectedDate}
      disableMobileView={true}
      inline={true}
    >
      <div className="flex gap-2 ml-2">
        <Button
          leftIcon="filter_alt"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            props.onSubmission([`${getNormalizedDate(selectedDate.from)}..${getNormalizedDate(selectedDate.to)}`]);
          }}
          tooltipText={dict.action.applyFilter}
          variant="primary"
          className="p-5 border border-border"
          disabled={props.disabled}
          aria-label={interpolate(dict.action.filterBy, props.label)}
        />
        <Button
          leftIcon="filter_list_off"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            props.onSubmission([]);
          }}
          tooltipText={dict.action.clearFilter}
          variant="secondary"
          disabled={!selectedDate || props.disabled}
          className="p-5 border border-border"
          aria-label={interpolate(dict.action.clearFilterFor, props.label)}
        />
      </div>
    </DateInput>
  );
}