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
    const [internalChecked, setInternalChecked] = useState<boolean>(false);
    const checkboxId: string = useId();

    // Use controlled value if provided, otherwise use internal state
    const isChecked: boolean = !props.checked ? props.checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked: boolean = e.target.checked;

        // Update internal state if component is uncontrolled
        if (!props.checked) {
            setInternalChecked(newChecked);
        }
        if (props.handleChange) {
            props.handleChange(newChecked);
        }
    };

    const disabledClasses: string = props.disabled ? "cursor-not-allowed" : "cursor-pointer";

    return (
        <div className="flex items-center space-x-2">
            <input
                id={checkboxId}
                type="checkbox"
                className={`${disabledClasses} ${props.className} accent-black dark:accent-white outline-none  focus-visible:ring-zinc-400 focus-visible:ring-[3px] focus-visible:ring-offset-1`}
                checked={isChecked}
                onChange={handleChange}
                role="checkbox"
                disabled={props.disabled}
                aria-checked={isChecked}
                aria-label={props["aria-label"] || props.label}
                {...props}
            />
            {!!props.labelComponent && props.labelComponent}
            {!props.labelComponent && props.label && (
                <label htmlFor={checkboxId} className="text-base text-gray-700 dark:text-gray-300">
                    {props.label}
                </label>
            )}
        </div>
    );
}
