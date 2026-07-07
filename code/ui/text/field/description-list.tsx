"use client";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import { parseWordsForLabels } from "@/utils/client-utils";
import { FieldValues } from "react-hook-form";

interface DescriptionListProps {
  data: FieldValues;
}

/**
 * This component renders a description list to mark up key value groups.
 *
 * @param {FieldValues} data Contains the content to render.
 */
export default function DescriptionList(props: Readonly<DescriptionListProps>) {
  const dict: Dictionary = useDictionary();
  return (
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
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
