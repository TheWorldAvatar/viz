"use client";

import React, { ReactNode, useId, useState } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked: boolean;
    label?: string;
    disabled?: boolean;
    labelComponent?: ReactNode;
    handleChange?: (_checked: boolean) => void;
}

/**
 * This component renders a checkbox component.
 *
 * @param {boolean} checked Controlled checked state.
 * @param {string} label Text label for the checkbox.
 * @param {boolean} disabled If the checkbox should be disabled.
 * @param {ReactNode} labelComponent An optional component that replaces the default text label if present.
 * @param handleChange Optional functionality to execute on change.
 */
export default function Checkbox(props: Readonly<CheckboxProps>) {
    const {
        checked,
        label,
        disabled,
        labelComponent,
        handleChange,
        ...rest
    } = props;
    const [internalChecked, setInternalChecked] = useState<boolean>(false);
    const checkboxId: string = useId();

    // Use controlled value if provided, otherwise use internal state
    const isChecked: boolean = !checked ? checked : internalChecked;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked: boolean = e.target.checked;

        // Update internal state if component is uncontrolled
        if (!props.checked) {
            setInternalChecked(newChecked);
        }
        if (handleChange) {
            handleChange(newChecked);
        }
    };

    const disabledClasses: string = disabled ? "cursor-not-allowed" : "cursor-pointer";

    return (
        <div className="flex items-center space-x-2">
            <input
                id={checkboxId}
                type="checkbox"
                className={`${disabledClasses} ${props.className} accent-black dark:accent-white outline-none  focus-visible:ring-zinc-400 focus-visible:ring-[3px] focus-visible:ring-offset-1`}
                checked={isChecked}
                onChange={handleInputChange}
                role="checkbox"
                disabled={disabled}
                aria-checked={isChecked}
                aria-label={props["aria-label"] || label}
                {...rest}
            />
            {!!labelComponent && labelComponent}
            {!labelComponent && label && (
                <label htmlFor={checkboxId} className="text-base text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
        </div>
    );
}
