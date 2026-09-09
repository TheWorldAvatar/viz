import { useState } from "react";
import Button from "@/ui/interaction/button";
import { parseWordsForLabels } from "@/utils/client-utils";
import ExpandableTextCell from "./expandable-text-cell";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrayTextCellProps {
    fields: Record<string, string>[];
}

/**
 * This component renders an array text cell that allows users to switch between array item.
 *
 * @param {Record<string, string>[]} fields A list of fields to display.
 */
export default function ArrayTextCell(props: Readonly<ArrayTextCellProps>) {
    const [currentFieldValue, setCurrentFieldValue] = useState<number>(0);
    const nestedFields: string[] = Object.keys(props.fields[currentFieldValue]);
    // Joined with newlines so that the collapsed clamp shows only the first field, and expanding
    // renders each field on its own line
    const fieldLines: string = nestedFields
        .map((nestedField) => `${parseWordsForLabels(nestedField)}: ${props.fields[currentFieldValue][nestedField]}`)
        .join("\n");

    return <div className="flex w-full items-end gap-1">
        <ExpandableTextCell text={fieldLines} className="min-w-0 flex-1" />
        {props.fields.length > 1 && <div className="flex shrink-0 items-center gap-1">
            <Button
                variant="info"
                leftIcon={ChevronLeft}
                size="icon-sm"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCurrentFieldValue(currentFieldValue - 1);
                }}
                disabled={currentFieldValue === 0}
                aria-label="Go to previous array field"
            />
            <Button
                variant="info"
                leftIcon={ChevronRight}
                size="icon-sm"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCurrentFieldValue(currentFieldValue + 1);
                }}
                disabled={currentFieldValue == props.fields.length - 1}
                aria-label="Go to next array field"
            />
        </div>}
    </div>
}