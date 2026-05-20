import { FloatingFocusManager, FloatingPortal, useTransitionStyles } from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { useState } from "react";
import { DropdownOption, DropdownProps } from "react-day-picker";
import { YEARS_PER_PAGE } from "utils/constants";
import Button from "../button";
import { Dictionary } from "types/dictionary";
import { useDictionary } from "hooks/useDictionary";

// Custom dropdown component for selecting years in react-day-picker
// This component implements pagination to show a range of years, with buttons to navigate to the next/previous range.
export default function CustomYearsDropdown(props: DropdownProps) {
    const dict: Dictionary = useDictionary();
    const popover = usePopover("bottom-start");
    const transition = useTransitionStyles(popover.context, { duration: 150 });
    const selectedYear: number = Number(props.value);
    const todayYear: number = new Date().getFullYear();
    const { setIsOpen } = popover;

    // Page starts at the currently selected year, or today if no year is selected
    const [pageStart, setPageStart] = useState(selectedYear || todayYear);
    const years: number[] = Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i);

    const selectYear = (year: number) => {
        // react-day-picker calls onChange with a synthetic select event
        props.onChange?.({
            target: { value: String(year) },
        } as React.ChangeEvent<HTMLSelectElement>);
        setIsOpen(false);
    };

    return (
        <>
            <Button
                variant="outline"
                rightIcon="expand_more"
                size="sm"
                iconSize="small"
                ref={popover.refs.setReference}
                {...popover.getReferenceProps()}
                className="text-sm"
            >
                {selectedYear}
            </Button>
            {popover.isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={popover.context} modal={false}>
                        <div
                            ref={popover.refs.setFloating}
                            style={{ ...popover.floatingStyles, zIndex: 99999 }}
                            {...popover.getFloatingProps()}
                        >
                            <div
                                style={transition.styles}
                                className="w-64 p-3 bg-muted rounded-lg shadow-md border border-border"
                            >
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-base font-semibold text-foreground">
                                        {pageStart} - {pageStart + YEARS_PER_PAGE - 1}
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            leftIcon="keyboard_arrow_up"
                                            iconSize="small"
                                            onClick={() => setPageStart(pageStart - YEARS_PER_PAGE)}
                                            aria-label="Previous years"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            iconSize="small"
                                            leftIcon="keyboard_arrow_down"
                                            onClick={() => setPageStart(pageStart + YEARS_PER_PAGE)}
                                            aria-label="Next years"
                                        />
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
                                                variant={isSelected ? "info" : "ghost"}
                                                disabled={isDisabled}
                                                onClick={() => selectYear(year)}
                                                className={`w-full h-10  text-sm ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                {year}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="info"
                                    size="xs"
                                    onClick={() => {
                                        setPageStart(todayYear);
                                        selectYear(todayYear);
                                    }}
                                    className="mt-2 w-full h-8 text-sm"
                                >
                                    {dict.title.today}
                                </Button>
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal >
            )
            }
        </>
    );
}