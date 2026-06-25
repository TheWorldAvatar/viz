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
            className="p-2 max-w-[90vw]">
            <div className="overflow-hidden rounded-md border border-border bg-background">
                {props.header && (
                    <div className="border-b border-border px-4 pt-4 pb-3 bg-ring">
                        {props.header}
                    </div>
                )}
                <dl>
                    {Object.entries(props.data).map(([key, value], index) => (
                        <div key={key + index} className="flex items-start justify-between gap-4 px-4 py-2.5">
                            <dt className="shrink-0 text-muted-foreground">
                                {parseWordsForLabels(translateLifecycleFields(key, dict.title))}
                            </dt>
                            <dd className="min-w-0 wrap-break-word text-right font-medium">
                                {`${value}`}
                            </dd>
                        </div>
                    ))}
                </dl>
                {props.actions && props.actions.length > 0 && (
                    <div className="flex items-stretch border-t border-border">
                        {props.actions.map((action, index) => (
                            <div
                                key={index}
                                className="flex flex-1 items-center justify-center py-1.5 border-border bg-ring not-first:border-l"
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
