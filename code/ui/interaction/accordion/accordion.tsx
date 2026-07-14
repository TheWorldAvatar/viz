"use client";

import { useResizeObserver } from "@/hooks/screen/useResizeObserver";
import React, { useState } from "react";
import Button from "../button";

interface AccordionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    isActive?: boolean;
    disabled?: boolean;
}

/** 
 * A component that renders an accordion component.
 * 
 * @param {string} id - The unique ID for the form accordion.
 * @param {string} title - The label for the trigger button.
 * @param children - A list of components to render as the accordion's body
 * @param {boolean} isActive - Uses an active variant for the accordion trigger if true.
 * @param {boolean} disabled An optional state to disable the filter. 
 **/
export default function Accordion(props: Readonly<AccordionProps>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { contentRef, contentHeight } = useResizeObserver(isOpen);

    return (
        <article className="flex flex-col mb-2 mt-0.5">
            <Button
                type="button"
                leftIcon={isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                size="sm"
                iconSize="small"
                variant={props.isActive ? "secondary" : "outline"}
                onClick={(): void => setIsOpen((prev) => !prev)}
                disabled={props.disabled}
                aria-label={props.title}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${props.id}`}
                className={`w-full justify-start min-h-10.5 shadow-xs ${props.isActive ? "border border-border" : ""}`}
            >
                {props.title}
            </Button>
            {isOpen &&
                <div
                    id={`accordion-content-${props.id}`}
                    role="region"
                    aria-labelledby={`accordion-button-${props.id}`}
                    className={`transition-all duration-300 ease-in-out overflow-hidden`}
                    style={{
                        maxHeight: `${contentHeight}px`,
                    }}
                >
                    <div ref={contentRef} className="pt-2 px-0.5 w-full overflow-hidden">
                        {props.children}
                    </div>
                </div>
            }
        </article>
    );
}
