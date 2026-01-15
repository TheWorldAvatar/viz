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
 * Text is truncated if it exceeds the maxLengthText value.
 *
 * @param {string} text The full text content.
 * @param {number} maxLengthText (Optional) The maximum text length before truncation.
 */
export default function ExpandableTextCell(props: Readonly<ExpandableTextCellProps>) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const maxLengthText: number = props.maxLengthText ?? 100;
    const dict: Dictionary = useDictionary();


    if (props.text.length <= maxLengthText) {
        return <div className="text-foreground">{props.text}</div>;
    }

    return (
        <div>
            <div className="text-foreground whitespace-pre-wrap w-fit">
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
