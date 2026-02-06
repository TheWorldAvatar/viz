import { useState } from "react";
import Button from "ui/interaction/button";
import SimpleSelector from "ui/interaction/dropdown/simple-selector";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { Icon } from "@mui/material";

interface NumericColumnFilterProps {
    options: string[];
    label: string;
    onSubmission: (_options: string[]) => void;
}

type ComparisonOperator = | "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "between"

type LogicOperator = "and" | "or";

const operators: { value: ComparisonOperator; label: string; }[] = [
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Does not equal" },
    { value: "gt", label: "Greater than" },
    { value: "gte", label: "Greater than or equal to" },
    { value: "lt", label: "Less than" },
    { value: "lte", label: "Less than or equal to" },
    { value: "between", label: "Between" },
]

/**
 * Evaluates a single numeric comparison condition.
 */
function matchesCondition(value: number, operator: ComparisonOperator, target: number, target2?: number): boolean {
    switch (operator) {
        case "eq": return value === target;
        case "neq": return value !== target;
        case "gt": return value > target;
        case "gte": return value >= target;
        case "lt": return value < target;
        case "lte": return value <= target;
        case "between": return target2 !== undefined && value >= target && value <= target2;
    }
}

/**
 * A numeric column filter component that allows filtering table data using one or two
 * numeric comparison conditions combined with AND/OR logic.
 *
 * @param {string[]} options The available column values to filter against.
 * @param {string} label The name of the column.
 * @param {void} onSubmission Function that submits the filtered options.
 */
export default function NumericColumnFilter(props: Readonly<NumericColumnFilterProps>) {
    const [value1, setValue1] = useState<string>("");
    const [value2, setValue2] = useState<string>("");
    const [selectedOperator1, setSelectedOperator1] = useState<ComparisonOperator>("eq");
    const [selectedOperator2, setSelectedOperator2] = useState<ComparisonOperator>("eq");
    const [logicOperator, setLogicOperator] = useState<LogicOperator>("and");

    const hasFirstValue: boolean = value1.trim() !== "";
    const hasSecondValue: boolean = value2.trim() !== "";
    const isBetween: boolean = selectedOperator1 === "between";

    function handleFilter(): void {
        const num1: number = parseFloat(value1);
        const num2: number = parseFloat(value2);

        const filtered: string[] = props.options.filter((option) => {
            const numericValue: number = parseFloat(option);
            if (isNaN(numericValue)) return false;

            // Between uses both values in a single condition
            if (isBetween) {
                if (isNaN(num1) || isNaN(num2)) return false;
                return matchesCondition(numericValue, "between", num1, num2);
            }

            const condition1: boolean = !isNaN(num1)
                ? matchesCondition(numericValue, selectedOperator1, num1)
                : true;

            if (!hasSecondValue || isNaN(num2)) {
                return condition1;
            }

            const condition2: boolean = matchesCondition(numericValue, selectedOperator2, num2);

            return logicOperator === "and"
                ? condition1 && condition2
                : condition1 || condition2;
        });

        props.onSubmission(filtered);
    }

    return (
        <div className="flex flex-col w-62 gap-2">
            {/* First condition */}
            <SimpleSelector
                options={operators}
                defaultVal={selectedOperator1}
                onChange={(selected) => {
                    if (selected) {
                        setSelectedOperator1((selected as SelectOptionType).value as ComparisonOperator);
                    }
                }}
            />
            <div className="relative">
                <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
                    <Icon className="material-symbols-outlined !text-lg leading-none">search</Icon>
                </span>
                <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                    value={value1}
                    placeholder={isBetween ? "From" : "Value..."}
                    aria-label={`first filter value for ${props.label}`}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onChange={(event) => {
                        setValue1(event.target.value);
                    }}
                />
            </div>

            {/* Between: show "To" input directly below "From" */}
            {isBetween && (
                <div className="relative">
                    <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
                        <Icon className="material-symbols-outlined !text-lg leading-none">search</Icon>
                    </span>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                        value={value2}
                        placeholder="To"
                        aria-label={`upper bound filter value for ${props.label}`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        onChange={(event) => {
                            setValue2(event.target.value);
                        }}
                    />
                </div>
            )}

            {/* Second condition — only shown when value1 is non-empty and not between */}
            {hasFirstValue && !isBetween && (
                <>
                    {/* AND / OR radio toggle */}
                    <div className="flex items-center justify-center gap-6 py-1">
                        <label htmlFor="and" className="flex items-center gap-1.5 text-sm">
                            <input
                                id="and"
                                type="radio"
                                name="logic-operator"
                                value="and"
                                checked={logicOperator === "and"}
                                onChange={() => setLogicOperator("and")}
                                className="accent-foreground"
                            />
                            AND
                        </label>
                        <label htmlFor="or" className="flex items-center gap-1.5 text-sm">
                            <input
                                id="or"
                                type="radio"
                                name="logic-operator"
                                value="or"
                                checked={logicOperator === "or"}
                                onChange={() => setLogicOperator("or")}
                                className="accent-foreground"
                            />
                            OR
                        </label>
                    </div>

                    <SimpleSelector
                        options={operators}
                        defaultVal={selectedOperator2}
                        onChange={(selected) => {
                            if (selected) {
                                setSelectedOperator2((selected as SelectOptionType).value as ComparisonOperator);
                            }
                        }}
                    />
                    <div className="relative">
                        <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
                            <Icon className="material-symbols-outlined !text-lg leading-none">search</Icon>
                        </span>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                            value={value2}
                            placeholder="Value..."
                            aria-label={`second filter value for ${props.label}`}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                            onChange={(event) => {
                                setValue2(event.target.value);
                            }}
                        />
                    </div>
                </>
            )}
            <Button
                variant="primary"
                className="w-full mt-1"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFilter();
                }}
                disabled={isBetween ? !hasFirstValue || !hasSecondValue : !hasFirstValue}
                aria-label={`Apply numeric filter for ${props.label}`}
            >
                Filter
            </Button>
        </div>
    );
}