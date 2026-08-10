import { useDictionary } from "@/hooks/useDictionary";
import { useEffect, useRef, useState } from "react";
import { Dictionary } from "@/types/dictionary";
import Button from "@/ui/interaction/button";

interface ExpandableTextCellProps {
    text: string;
    className?: string;
}

/**
 * This component renders text truncated to a single line, with the "Show more" button immediately
 * after it, so that every table row stays equally tall. Truncation is done with CSS against the
 * rendered column width, so the widths configured in the table column settings are always
 * respected.
 *
 * @param {string} text The full text content.
 * @param {string} className Optional additional CSS classes for the container.
 */
export default function ExpandableTextCell(props: Readonly<ExpandableTextCellProps>) {
    const dict: Dictionary = useDictionary();
    const textRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    // Truncation is measured on mount, whenever the text changes, and again on collapse
    useEffect(() => {
        const element: HTMLDivElement = textRef.current;
        if (!element || isExpanded) return;
        // line-clamp lays out every line and only hides the ones past the limit, so scrollHeight
        // stays the height the full text needs rather than the height on screen. 28px is one line at
        // the text-lg the cell inherits, so anything taller means the text was clipped and needs the
        // button.
        setIsOverflowing(element.scrollHeight > 28);
    }, [props.text, isExpanded]);

    return (
        <div className={`${isExpanded ? "" : "flex items-center"} ${props.className ?? ""}`}>
            <div
                ref={textRef}
                // line-clamp rather than truncate, because the nowrap that truncate applies would make
                // the text unbreakable and widen the whole column
                className={`mr-2 min-w-0 whitespace-pre-wrap text-foreground ${isExpanded ? "inline wrap-break-word" : "flex-1 line-clamp-1 break-all"}`}
            >
                {props.text}
            </div>
            {(isExpanded || isOverflowing) && (
                <div className="inline-flex align-middle">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        variant="ghost"
                        size="icon"
                        leftIcon={isExpanded ? "collapse_content" : "read_more"}
                        tooltipText={isExpanded ? dict.action.showLess : dict.action.showMore}
                        aria-label={isExpanded ? dict.action.showLess : dict.action.showMore}
                        className="text-info-foreground!"
                    />
                </div>
            )}
        </div>
    );
}
