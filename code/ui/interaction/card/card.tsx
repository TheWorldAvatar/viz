"use client";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import { parseWordsForLabels } from "@/utils/client-utils";
import { VirtualItem } from "@tanstack/react-virtual";
import { FieldValues } from "react-hook-form";

interface CardProps {
    data: FieldValues;
    virtualItem: VirtualItem;
    ref: (node: Element) => void;
    header?: React.ReactNode;
    actions?: React.ReactNode[];
}

/**
 * This component renders a card component.
 *
 * @param {FieldValues} data Contains the content to render. Must have id, date, and status.
 * @param {VirtualItem} virtualItem A virtual item to support virtualisation.
 * @param ref A callback for the virtual item referencing functionality.
 * @param {React.ReactNode} header A header component to render.
 * @param {React.ReactNode} actions Renders these optional action components.
 */
export default function Card(props: Readonly<CardProps>) {
    const dict: Dictionary = useDictionary();
    return (
        <div
            ref={props.ref}
            data-index={props.virtualItem.index}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${props.virtualItem.start}px)`,
            }}
            className="border border-border bg-ring rounded p-3 accent-black dark:accent-white max-w-[90vw]">
            {props.header}
            {props.actions}
            {Object.entries(props.data).map(([key, value], index) => {
                return <p key={key + index} className="rounded text-wrap py-2 px-4 bg-background">
                    {`${parseWordsForLabels(translateLifecycleFields(key, dict.title))}: ${value}`}
                </p>
            })}
        </div>
    );
}
