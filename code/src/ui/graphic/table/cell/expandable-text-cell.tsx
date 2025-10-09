import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ExpandableTextCellProps {
    text: string;
    maxLengthText?: number;
}

/**
 * This component renders expandable text with a "Show more/Show less" button.
 * Text is truncated if it exceeds the maxLength.
 *
 * @param {string} text The full text content.
 * @param {number} maxLengthText The maximum text length before truncation. Defaults to 100.
 */
export default function ExpandableTextCell(props: Readonly<ExpandableTextCellProps>) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const maxLengthText = props.maxLengthText ?? 100;
    const shouldTruncate = props.text && props.text.length > maxLengthText;
    const dict: Dictionary = useDictionary();


    if (!shouldTruncate) {
        return <div>{props.text}</div>;
    }

    return (
        <div className="text-foreground">
            <div className="whitespace-pre-wrap break-all">
                {isExpanded ? props.text : `${props.text.substring(0, maxLengthText)}...`}
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
