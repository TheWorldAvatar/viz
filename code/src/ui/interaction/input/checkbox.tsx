"use client";

import React, { useState, useId } from "react";

interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    checked: boolean;
    onChange: (_checked: boolean) => void;
    className?: string;
    label?: string;
    ariaLabel?: string;
    disabled?: boolean;
}

export default function Checkbox({
    className = "",
    label,
    checked,
    onChange,
    ariaLabel,
    disabled,
    ...props
}: Readonly<CheckboxProps>) {
    const [internalChecked, setInternalChecked] = useState<boolean>(false);
    const checkboxId: string = useId();

    // Use controlled value if provided, otherwise use internal state
    const isChecked: boolean = checked !== undefined ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked: boolean = e.target.checked;

        // Update internal state if component is uncontrolled
        if (checked === undefined) {
            setInternalChecked(newChecked);
        }
        if (onChange) {
            onChange(newChecked);
        }
    };


    const disabledClasses: string = disabled ? "cursor-not-allowed" : "cursor-pointer";

    return (
        <div className="flex items-center space-x-2">
            <input
                id={checkboxId}
                type="checkbox"
                className={`${disabledClasses} ${className} accent-black dark:accent-white outline-none  focus-visible:ring-zinc-400 focus-visible:ring-[3px] focus-visible:ring-offset-1`}
                checked={isChecked}
                onChange={handleChange}
                role="checkbox"
                disabled={disabled}
                aria-checked={isChecked}
                aria-label={ariaLabel || label}
                {...props}
            />
            {label && (
                <label htmlFor={checkboxId} className="text-base text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
        </div>
    );
}
