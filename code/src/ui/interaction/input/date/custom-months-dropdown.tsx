import { FloatingFocusManager, FloatingPortal, useTransitionStyles } from "@floating-ui/react";
import { usePopover } from "hooks/float/usePopover";
import { DropdownOption, DropdownProps } from "react-day-picker";
import Button from "../../button";

// Custom dropdown component for selecting months in react-day-picker
// Renders a 3x4 grid of localized month names
export default function CustomMonthsDropdown(props: DropdownProps) {
    const popover = usePopover("bottom-start");
    const transition = useTransitionStyles(popover.context, { duration: 150 });
    const selectedMonth: number = Number(props.value);
    const { setIsOpen } = popover;

    const selectMonth = (month: number) => {
        // react-day-picker calls onChange with a synthetic select event
        props.onChange?.({
            target: { value: String(month) },
        } as React.ChangeEvent<HTMLSelectElement>);
        setIsOpen(false);
    };

    const selectedLabel: string = props.options?.find((o) => o.value === selectedMonth)?.label ?? "";

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
                {selectedLabel}
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
                                className="w-70 p-3 bg-muted rounded-lg shadow-md border border-border"
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
                                                variant={isSelected ? "info" : "ghost"}
                                                disabled={isDisabled}
                                                onClick={() => selectMonth(Number(option.value))}
                                                className={`w-full h-10 text-sm ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                {option.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </>
    );
}