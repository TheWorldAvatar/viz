import { useState } from "react";
import Button from "ui/interaction/button";
import { parseWordsForLabels } from "utils/client-utils";
import ExpandableTextCell from "./expandable-text-cell";

interface ArrayTextCellProps {
    fields: Record<string, string>[];
    maxLengthText: number;
}

/**
 * This component renders an array text cell that allows users to switch between array item.
 *
 * @param {Record<string, string>[]} fields A list of fields to display.
 * @param {number} [maxLengthText] maximum length of text to display before truncation.
 */
export default function ArrayTextCell(props: Readonly<ArrayTextCellProps>) {
    const [currentFieldValue, setCurrentFieldValue] = useState<number>(0);
    const nestedFields: string[] = Object.keys(props.fields[currentFieldValue]);

    return <div>
        {props.fields.length > 1 && <div className="flex gap-2 justify-end mb-2">
            <Button
                variant="info"
                leftIcon="keyboard_arrow_left"
                size="icon"
                iconSize="small"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCurrentFieldValue(currentFieldValue - 1);
                }}
                disabled={currentFieldValue === 0}
                aria-label="Go to previous array field"
                className="h-8 w-8"
            />
            <Button
                variant="info"
                leftIcon="keyboard_arrow_right"
                size="icon"
                iconSize="small"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCurrentFieldValue(currentFieldValue + 1);
                }}
                disabled={currentFieldValue == props.fields.length - 1}
                aria-label="Go to next array field"
                className="h-8 w-8"
            />
        </div>}
        <div className="min-w-56">
            {nestedFields.map((nestedField) => (
                <ExpandableTextCell
                    key={nestedField}
                    text={parseWordsForLabels(nestedField) + ": " + props.fields[currentFieldValue][nestedField]}
                    maxLengthText={props.maxLengthText}
                    overrideExpansion={false}
                />
            ))}
        </div>
    </div>
}