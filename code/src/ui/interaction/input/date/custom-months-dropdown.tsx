import { DropdownOption, DropdownProps } from "react-day-picker";
import Button from "../../button";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { useState } from "react";

// Custom dropdown component for selecting months in react-day-picker
// Renders a 3x4 grid of localized month names
export default function CustomMonthsDropdown(props: DropdownProps) {
    const dict: Dictionary = useDictionary();
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const selectedMonth: number = Number(props.value);

    const selectMonth = (month: number) => {
        // react-day-picker calls onChange with a synthetic select event
        props.onChange?.({
            target: { value: String(month) },
        } as React.ChangeEvent<HTMLSelectElement>);
        setIsOpen(false);
    };

    const selectedLabel: string = props.options?.find((o) => o.value === selectedMonth)?.label ?? "";

    return (
        <PopoverActionButton
            variant="outline"
            placement="bottom-start"
            rightIcon="expand_more"
            size="sm"
            iconSize="small"
            className="text-sm"
            label={selectedLabel}
            aria-label={`${dict.form.month}, ${selectedLabel}`}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <div className="grid grid-cols-3 gap-2">
                {props.options?.map((option: DropdownOption) => {
                    const isSelected: boolean = option.value === selectedMonth;
                    const isDisabled: boolean = !!option.disabled;
                    return (
                        <Button
                            key={option.value}
                            size="xs"
                            aria-label={option.label}
                            aria-pressed={isSelected}
                            variant={isSelected ? "info" : "ghost"}
                            disabled={isDisabled}
                            onClick={() => selectMonth(Number(option.value))}
                            className={`w-full min-w-12 min-h-12 text-sm ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {option.label}
                        </Button>
                    );
                })}
            </div>
        </PopoverActionButton>

    );
}