import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Dictionary } from "types/dictionary";
import { LifecycleStageMap } from "types/form";
import Button from "ui/interaction/button";
import DateInput from "ui/interaction/input/date-input";
import { getInitialDateFromLifecycleStage, getNormalizedDate, interpolate } from "utils/client-utils";

interface DateColumnFilterProps {
  label: string;
  onSubmission: (_dates: string) => void;
}

/**
 * A column filter component to filter the table by date.
 *
 * @param {string} label The name of the column.
 * @param {void} onSubmission Function that submits the filtered date range.
 */
export default function DateColumnFilter(props: Readonly<DateColumnFilterProps>) {
  const dict: Dictionary = useDictionary();
  const [selectedDate, setSelectedDate] = useState<DateRange>(
    getInitialDateFromLifecycleStage(LifecycleStageMap.GENERAL)
  );

  return (
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
          props.onSubmission(`${getNormalizedDate(selectedDate.from)}..${getNormalizedDate(selectedDate.to)}`);
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
        className="h-full rounded-l-none w-12"
        aria-label={interpolate(dict.action.clearFilterFor, props.label)}
      />
    </div>
  );
}