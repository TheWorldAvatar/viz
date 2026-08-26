"use client";

import React from 'react';

import type { LucideIcon } from "lucide-react";
import styles from './icon-button.module.css';

// Interface for properties
interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: LucideIcon,
    iconStyles?: string[],
    text?: {
        styles?: string[],
        content: string,
    }
    callback?: () => void,
}

interface IndexedButtonProps extends ButtonProps {
    index?: number,
    onButtonClick: (_index: number) => void;
}

/**
 * An icon button with custom styling and icons.
 * 
 * @param {LucideIcon} icon The lucide icon component to render.
 * @param {string[]} iconStyles An optional array of CSS class names for the icon.
 * @param {string} text.content An optional text content if required.
 * @param {string[]} text.styles An optional array of CSS class names for the text content.
 * @param {Function} callback An optional callback function if required.
 */
export default function IconButton({ icon: Icon, iconStyles, text, callback, ...rest }: ButtonProps) {
    // CSS classes
    const containerClassNames: string = `${rest.className || ''} ${styles["icon-button-container"]}`.trim();
    const iconClassNames: string = [styles["icon-button"]].concat(iconStyles).join(" ");
    const textClassNames: string = text?.styles?.join(" ");

    return (
        <div {...rest} className={containerClassNames}>
            <Icon className={iconClassNames} onClick={callback} aria-hidden />
            {
                text && (
                    <span className={textClassNames}>
                        {text?.content}
                    </span>
                )
            }
        </div>
    );
}

/**
 * An icon button that can interact with click events based on the their index.
 * 
 * @param {number} index An optional index for this component. Defaults to 0 if excluded.
 * @param {Function} onButtonClick A function called on the index when clicking the button.
 */
export function IconButtonWithIndex({ index, onButtonClick, ...rest }: IndexedButtonProps) {
    const [position] = React.useState(index ? index : 0);

    const handleClick = () => {
        onButtonClick(position);
    };

    return (
        <IconButton {...rest} onClick={handleClick} />
    );
}