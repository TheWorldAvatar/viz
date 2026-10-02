"use client";

import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { translateLifecycleFields } from "@/ui/graphic/table/registry/registry-table-utils";
import { parseWordsForLabels } from "@/utils/client-utils";
import { FieldValues } from "react-hook-form";

interface DescriptionListProps {
  data: FieldValues;
}
interface DescriptionListItemProps {
  field: string;
  value: string;
}

/**
 * This component renders a description list to mark up key value groups.
 *
 * @param {FieldValues} data Contains the content to render.
 */
export default function DescriptionList(props: Readonly<DescriptionListProps>) {
  const dict: Dictionary = useDictionary();
  const getClassName = (val: unknown) =>
    String(val).length > 40
      ? "flex flex-col gap-1 px-4 py-2.5"
      : "flex items-start justify-between gap-4 px-4 py-2.5";
  return (
    <dl>
      {Object.entries(props.data).map(([key, value], index) => {
        if (Array.isArray(value)) {
          return value.flatMap(arrayItem => {
            return Object.entries(arrayItem).map(([itemKey, itemValue], itemIdx) => {
              return <div
                key={`${key}-${index}-${itemKey}-${itemIdx}`}
                className={getClassName(itemValue)}
              >
                <DescriptionListItem
                  key={key + index}
                  field={`${itemKey} ${itemIdx + 1}`}
                  value={itemValue as string}
                />
              </div>
            });
          });
        }
        return <div
          key={key + index}
          className={getClassName(value)}
        >
          <DescriptionListItem
            field={translateLifecycleFields(key, dict.title)}
            value={value}
          />
        </div>
      })}
    </dl>
  );
}

function DescriptionListItem(props: Readonly<DescriptionListItemProps>) {
  const valClasses: string = props.value.length > 40 ? "whitespace-pre-wrap wrap-break-word font-medium" :
    "whitespace-pre-wrap min-w-0 wrap-break-word text-right font-medium";

  return (<>
    <dt className="shrink-0 text-muted-foreground">
      {parseWordsForLabels(props.field)}
    </dt>
    <dd className={valClasses}>
      {props.value}
    </dd>
  </>);
}
