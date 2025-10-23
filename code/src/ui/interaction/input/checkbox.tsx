"use client";

import React, { useState, useId } from "react";
import { Icon } from "@mui/material";

interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    checked: boolean;
    onChange: (_checked: boolean) => void;
    className?: string;
    label?: string;
    ariaLabel?: string;
    ariaDescribedby?: string;
    disabled?: boolean;
}

export default function Checkbox({
    className = "",
    label,
    checked,
    onChange,
    ariaLabel,
    ariaDescribedby,
    disabled,
    ...props
}: Readonly<CheckboxProps>) {
    const [internalChecked, setInternalChecked] = useState<boolean>(false);
    const checkboxId: string = useId();

    // Use controlled value if provided, otherwise use internal state
    const isChecked: boolean = checked !== undefined ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked: boolean = e.target.checked;
        if (checked === undefined) {
            setInternalChecked(newChecked);
        }
        onChange?.(newChecked);
    };


    const baseClasses: string = `${isChecked ? "bg-black dark:bg-white border-none" : "border-border  bg-white dark:bg-ring"}
    size-4 shrink-0 rounded-sm border shadow-xs transition-all duration-50
    outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
    disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center
  `;

    const disabledClasses: string = disabled ? "cursor-not-allowed opacity-50" : "";

    return (
        <div className="flex items-center space-x-2">
            <input
                id={checkboxId}
                type="checkbox"
                className="sr-only" // Screen reader only, not completely hidden
                checked={isChecked}
                onChange={handleChange}
                role="checkbox"
                disabled={disabled}
                aria-checked={isChecked}
                aria-label={ariaLabel || label}
                aria-describedby={ariaDescribedby}
                {...props}
            />
            <label htmlFor={checkboxId} className="cursor-pointer">
                <span
                    className={`${baseClasses} ${className} ${disabledClasses}`.trim()}
                    aria-hidden="true" // This is just visual, screen reader uses the input
                >
                    <Icon
                        fontSize="small"
                        className={`material-symbols-outlined text-white dark:text-black transition-opacity duration-50 ${isChecked ? "opacity-100" : "opacity-0"}`}
                    >
                        check
                    </Icon>
                </span>
            </label>
            {label && (
                <label htmlFor={checkboxId} className="text-base text-gray-700 dark:text-gray-300 cursor-pointer">
                    {label}
                </label>
            )}
        </div>
    );
}
