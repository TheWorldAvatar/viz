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
    const [isTruncated, setIsTruncated] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        const element: HTMLDivElement = textRef.current;
        // Measuring only means anything while the clamp is applied, so it is skipped while expanded
        // and rerun on collapse, keeping the last answer in between
        if (!element || isExpanded) return;
        // The clamped element overflows its own box whenever the text does not fit.
        setIsTruncated(element.scrollHeight > element.clientHeight);
    }, [props.text, isExpanded]);

    return (
        <div className={`${isExpanded ? "" : "flex items-center"} ${props.className ?? ""}`}>
            <div
                ref={textRef}
                // line-clamp rather than truncate, because the nowrap that truncate applies would make
                // the text unbreakable and widen the whole column
                className={`mr-2 min-w-0 text-foreground ${isExpanded ? "inline wrap-break-word whitespace-pre-wrap" : "flex-1 line-clamp-1 break-all"}`}
            >
                {props.text}
            </div>
            {(isExpanded || isTruncated) && (
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
