import { useState } from "react";
import { parseWordsForLabels } from "utils/client-utils";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ArrayTextCellProps {
    fields: Record<string, string>[];
}

const MAX_VISIBLE = 2;

export default function ArrayTextCell(props: Readonly<ArrayTextCellProps>) {
    const dict: Dictionary = useDictionary();
    const [showAll, setShowAll] = useState<boolean>(false);

    const visibleFields = showAll ? props.fields : props.fields.slice(0, MAX_VISIBLE);
    const hiddenCount: number = props.fields.length - MAX_VISIBLE;

    return (
        <div className="flex flex-col gap-1">
            {visibleFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                    {Object.entries(field).map(([key, value]) => (
                        <span key={key}>
                            <span>
                                {parseWordsForLabels(key)}:
                            </span>
                            <span className="ml-2">{value}</span>
                        </span>
                    ))}
                </div>
            ))}

            {hiddenCount > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    className="!text-blue-500 text-base text-left hover:underline !p-0"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAll(!showAll);
                    }}
                >
                    {showAll ? dict.action.showLess : dict.action.showMoreWithCount.replace("{replace}", String(hiddenCount))}
                </Button>
            )}
        </div>
    );
}