import { ColumnDef } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ExpandableTextCellProps {
    text: string;
    maxLengthText?: number;
    tableColumns: ColumnDef<FieldValues>[];
}

/**
 * This component renders expandable text with a "Show more/Show less" button.
 * Text is truncated if it exceeds the maxLengthText value.
 *
 * @param {string} text The full text content.
 * @param {number} maxLengthText (Optional) The maximum text length before truncation.
 * @param {ColumnDef<FieldValues>[]} tableColumns The columns in the table.
 */
export default function ExpandableTextCell(props: Readonly<ExpandableTextCellProps>) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const maxLengthText: number = props.maxLengthText ?? 100;
    const dict: Dictionary = useDictionary();

    if (props.text.length <= maxLengthText || props.tableColumns.length <= 2) {
        return <div className="text-foreground">{props.text}</div>;
    }

    return (
        <div>
            <div className={`text-foreground whitespace-pre-wrap ${props.text.length > 200 ?
                "w-[400px] lg:w-[500px] break-words" :
                "w-fit"}`}>
                {isExpanded ? props.text : `${props.text.substring(0, props.text.length > 200 ? 50 : maxLengthText)}...`}
            </div>
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                variant="link"
                size="sm"
                className="text-base !text-blue-500 !p-0"
            >
                {isExpanded ? dict.action.showLess : dict.action.showMore}
            </Button>
        </div>
    );
}
