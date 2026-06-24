"use client";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import StatusComponent from "@/ui/text/status/status";
import { parseWordsForLabels } from "@/utils/client-utils";
import { FieldValues } from "react-hook-form";

interface CardProps {
    data: FieldValues;
    action?: React.ReactNode;
}

/**
 * This component renders a card component.
 *
 * @param {FieldValues} data Contains the content to render. Must have id, date, and status.
 * @param {React.ReactNode} action An action component to render.
 */
export default function Card(props: Readonly<CardProps>) {
    const dict: Dictionary = useDictionary();
    return (
        <div className="border border-border bg-ring rounded p-3 accent-black dark:accent-white max-w-[90vw]">
            <h3 className="text-lg">
                {`# ${props.data.id}`}
            </h3>
            <div className="flex justify-start">
                <StatusComponent status={props.data.status} />
            </div>
            <p className="text-base pb-4">
                {props.data.date}
            </p>
            {props.action}
            {Object.entries(props.data).map(([key, value], index) => {
                return <p key={key + index} className="rounded text-wrap py-2 px-4 bg-background">
                    {`${parseWordsForLabels(translateLifecycleFields(key, dict.title))}: ${value}`}
                </p>
            })}
        </div>
    );
}
