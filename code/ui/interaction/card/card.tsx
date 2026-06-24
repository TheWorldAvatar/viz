"use client";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import { parseWordsForLabels } from "@/utils/client-utils";
import { FieldValues } from "react-hook-form";

interface CardProps {
    data: FieldValues;
    header?: React.ReactNode;
    actions?: React.ReactNode[];
}

/**
 * This component renders a card component.
 *
 * @param {FieldValues} data Contains the content to render. Must have id, date, and status.
 * @param {React.ReactNode} header A header component to render.
 * @param {React.ReactNode} actions Renders these optional action components.
 */
export default function Card(props: Readonly<CardProps>) {
    const dict: Dictionary = useDictionary();
    return (
        <div className="border border-border bg-ring rounded p-3 accent-black dark:accent-white max-w-[90vw]">
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
