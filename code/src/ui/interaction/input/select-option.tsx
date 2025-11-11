"use client";

import React, { useState } from "react";
import Checkbox from "./checkbox";

interface SelectOptionProps {
    option: string;
    initialChecked: boolean;
    onClick?: () => void;
}

/**
 * This component renders a simple select option component.
 *
 * @param {String} option The display value
 * @param {boolean} initialChecked If the option starts as checked.
 * @param onClick Additional functions to be executed on click.
 */
export default function SelectOption(props: Readonly<SelectOptionProps>) {
    const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(props.initialChecked);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setUncontrolledChecked(!uncontrolledChecked);
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <div onClick={handleClick} className={`${uncontrolledChecked ? "bg-background-tertiary" : ""} hover:bg-background-tertiary p-2 my-0.5 cursor-pointer`}>
            <Checkbox
                checked={uncontrolledChecked}
                onChange={() => setUncontrolledChecked(!uncontrolledChecked)}
                className="mr-3"
                label={props.option}
                ariaLabel={props.option}
            />
        </div>
    );
}
