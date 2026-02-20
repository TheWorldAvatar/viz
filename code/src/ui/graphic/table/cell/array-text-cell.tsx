import { useState } from "react";
import { parseWordsForLabels } from "utils/client-utils";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ArrayTextCellProps {
    fields: Record<string, string>[];
}

const MAX_VISIBLE_ARRAY_ITEMS = 2;

export default function ArrayTextCell(props: Readonly<ArrayTextCellProps>) {
    const dict: Dictionary = useDictionary();
    const [showAll, setShowAll] = useState<boolean>(false);

    const visibleFields = showAll ? props.fields : props.fields.slice(0, MAX_VISIBLE_ARRAY_ITEMS);
    const hiddenCount: number = props.fields.length - MAX_VISIBLE_ARRAY_ITEMS;

    return (
        <div className="flex flex-col gap-2">
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
                {visibleFields.map((field, index) => (
                    <li key={index}>
                        {/* we can use a description list for Label:Value pairs (semantically correct) */}
                        <dl className="flex gap-2 m-0">
                            {Object.entries(field).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                    <dt>
                                        {parseWordsForLabels(key)}:
                                    </dt>
                                    <dd className="m-0">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </li>
                ))}
            </ul>

            {hiddenCount > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    className="!text-blue-500 text-base text-left hover:underline !p-0 w-fit"
                    aria-expanded={showAll}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAll(!showAll);
                    }}
                >
                    {showAll
                        ? dict.action.showLess
                        : dict.action.showMoreWithCount.replace("{replace}", String(hiddenCount))
                    }
                </Button>
            )}
        </div>
    );
}