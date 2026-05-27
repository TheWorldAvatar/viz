import { useState } from "react";
import { DropdownOption, DropdownProps } from "react-day-picker";
import { YEARS_PER_PAGE } from "utils/constants";
import Button from "../../button";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Tooltip from "ui/interaction/tooltip/tooltip";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";

// Custom dropdown component for selecting years in react-day-picker
// This component implements pagination to show a range of years, with buttons to navigate to the next/previous range.
export default function CustomYearsDropdown(props: DropdownProps) {
    const dict: Dictionary = useDictionary();
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const selectedYear: number = Number(props.value);
    const currentYear: number = new Date().getFullYear();

    // Page starts at the currently selected year, or today if no year is selected
    const [pageStart, setPageStart] = useState(selectedYear || currentYear);
    const years: number[] = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);

    const selectYear = (year: number) => {
        // react-day-picker calls onChange with a synthetic select event
        props.onChange?.({
            target: { value: String(year) },
        } as React.ChangeEvent<HTMLSelectElement>);
        setIsOpen(false);
    };

    return (
        <PopoverActionButton
            variant="outline"
            placement="bottom-start"
            rightIcon="expand_more"
            size="sm"
            iconSize="small"
            className="text-sm"
            label={String(selectedYear)}
            aria-label={`${dict.form.year}, ${selectedYear}`}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-base font-semibold text-foreground">
                    {pageStart} - {pageStart + YEARS_PER_PAGE - 1}
                </span>
                <div className="flex gap-1">
                    <Tooltip text={dict.action.previousYears} placement="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            leftIcon="keyboard_arrow_up"
                            iconSize="small"
                            onClick={() => setPageStart(pageStart - YEARS_PER_PAGE)}
                            aria-label={dict.action.previousYears}
                        />
                    </Tooltip>
                    <Tooltip text={dict.action.nextYears} placement="top">
                        <Button
                            variant="ghost"
                            size="icon"
                            iconSize="small"
                            leftIcon="keyboard_arrow_down"
                            onClick={() => setPageStart(pageStart + YEARS_PER_PAGE)}
                            aria-label={dict.action.nextYears}
                        />
                    </Tooltip>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {years.map((year) => {
                    const option: DropdownOption = props.options?.find((o) => o.value === year);
                    const isSelected: boolean = year === selectedYear;
                    const isDisabled: boolean = !option || option.disabled;
                    return (
                        <Button
                            key={year}
                            size="xs"
                            aria-label={String(year)}
                            aria-pressed={isSelected}
                            variant={isSelected ? "info" : "ghost"}
                            disabled={isDisabled}
                            onClick={() => selectYear(year)}
                            className={`w-full min-h-12 min-w-12 text-sm ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {year}
                        </Button>
                    );
                })}
            </div>
        </PopoverActionButton>
    );
}