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
            className="px-1.5 py-3 max-w-[90vw]">
            <div className="overflow-hidden rounded-md border border-card-border bg-card text-foreground">
                {props.header && (
                    <div className="border-b border-card-border px-4 pt-4 pb-3 bg-card-header">
                        {props.header}
                    </div>
                )}
                <dl>
                    {Object.entries(props.data).map(([key, value], index) => {
                        // For long values, stack the label above a full-width, left-aligned value instead.
                        const isLongValue: boolean = value.length > 40;
                        return (
                            <div
                                key={key + index}
                                className={isLongValue
                                    ? "flex flex-col gap-1 px-4 py-2.5"
                                    : "flex items-start justify-between gap-4 px-4 py-2.5"}
                            >
                                <dt className="shrink-0 text-muted-foreground">
                                    {parseWordsForLabels(translateLifecycleFields(key, dict.title))}
                                </dt>
                                <dd className={isLongValue
                                    ? "whitespace-pre-wrap wrap-break-word font-medium"
                                    : "whitespace-pre-wrap min-w-0 wrap-break-word text-right font-medium"}>
                                    {`${value}`}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
                {props.actions && props.actions.length > 0 && (
                    <div className="flex items-stretch border-t border-card-border bg-card-footer">
                        {props.actions.map((action, index) => (
                            <div
                                key={index}
                                className="flex flex-1 items-center justify-center px-2 py-2.5 border-card-border not-first:border-l"
                            >
                                {action}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
