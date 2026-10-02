import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import Button from "@/ui/interaction/button";
import Checkbox from "@/ui/interaction/input/checkbox";
import DateInput from "@/ui/interaction/input/date/date-input";
import { getNormalizedDate, interpolate } from "@/utils/client-utils";
import { Filter, FunnelX } from "lucide-react";
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
  const [isOptional, setIsOptional] = useState<boolean>(props.currentVal?.includes("null"));
  const [selectedDate, setSelectedDate] = useState<DateRange>(props.currentVal && props.currentVal != "null" ?
    { from: new Date(from), to: new Date(to) } : undefined);

  return (
    <>
      <DateInput
        mode="range"
        variant="info_banner"
        ariaLabel={interpolate(dict.message.pickDateRangeFor, props.label)}
        selectedDate={selectedDate}
        setSelectedDateRange={setSelectedDate}
        disableMobileView={true}
        inline={true}
      >
        <div className="flex items-center gap-2 ml-2">
          <Button
            leftIcon={Filter}
            size="icon-lg"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              let input: string = selectedDate ? `${getNormalizedDate(selectedDate.from)}..${getNormalizedDate(selectedDate.to)}` : "";
              if (isOptional) {
                input = input ? `${input}..null` : "null";
              }
              props.onSubmission([input]);
            }}
            tooltipText={dict.action.applyFilter}
            disabled={props.disabled || (!selectedDate && !isOptional)}
            aria-label={interpolate(dict.action.filterBy, props.label)}
          />
          <Button
            leftIcon={FunnelX}
            size="icon-lg"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              props.onSubmission([]);
            }}
            tooltipText={dict.action.clearFilter}
            variant="secondary"
            disabled={!selectedDate || props.disabled}
            aria-label={interpolate(dict.action.clearFilterFor, props.label)}
          />
        </div>
      </DateInput>
      <Checkbox
        label={dict.form.includeBlanks}
        aria-label={dict.form.includeBlanks}
        className="cursor-pointer"
        checked={isOptional}
        handleChange={(checked) => {
          setIsOptional(checked);
        }}
      />
    </>
  );
}