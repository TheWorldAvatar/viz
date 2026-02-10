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
    const [value1, setValue1] = useState<number | null>(null);
    const [value2, setValue2] = useState<number | null>(null);
    const [value3, setValue3] = useState<number | null>(null);
    const [selectedOperator1, setSelectedOperator1] = useState<ComparisonOperator>("eq");
    const [selectedOperator2, setSelectedOperator2] = useState<ComparisonOperator>("eq");
    const [logicOperator, setLogicOperator] = useState<LogicOperator>("and");

    const hasFirstValue: boolean = value1 !== null && !Number.isNaN(value1);
    const hasSecondValue: boolean = value2 !== null && !Number.isNaN(value2);
    const hasThirdValue: boolean = value3 !== null && !Number.isNaN(value3);
    const isBetweenFirst: boolean = selectedOperator1 === "between";
    const isBetweenSecond: boolean = selectedOperator2 === "between";

    const handleFilter = (): void => {
        if (!hasFirstValue) return;

        const filtered: string[] = props.options.filter((option) => {
            const numericValue: number = Number(option);
            if (Number.isNaN(numericValue)) return false;

            if (isBetweenFirst) {
                if (!hasSecondValue) return false;
                return matchesCondition(numericValue, "between", value1!, value2!);
            }

            const condition1: boolean = matchesCondition(numericValue, selectedOperator1, value1!);

            if (!hasSecondValue) return condition1;

            if (isBetweenSecond) {
                if (!hasThirdValue) return false;
                const condition2Between: boolean = matchesCondition(numericValue, "between", value2!, value3!);
                return logicOperator === "and" ? condition1 && condition2Between : condition1 || condition2Between;
            }

            const condition2: boolean = matchesCondition(numericValue, selectedOperator2, value2!);

            return logicOperator === "and" ? condition1 && condition2 : condition1 || condition2;
        });

        props.onSubmission(filtered);
    }

    const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div className="flex flex-col w-62 gap-2">
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
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                    value={value1 ?? ""}
                    placeholder={isBetweenFirst ? "From" : "Value..."}
                    aria-label={`first filter value for ${props.label}`}
                    onKeyDown={blockInvalidNumberKeys}
                    onChange={(e) => {
                        const value = e.currentTarget.valueAsNumber;
                        setValue1(Number.isNaN(value) ? null : value);
                    }}
                />
            </div>
            {hasFirstValue && !isBetweenFirst && (
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
                </>
            )}
            {(hasFirstValue || isBetweenFirst || isBetweenSecond) &&
                <div className="relative">
                    <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
                        <Icon className="material-symbols-outlined !text-lg leading-none">search</Icon>
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                        value={value2 ?? ""}
                        placeholder={isBetweenFirst ? "To" : isBetweenSecond ? "From" : "Value..."}
                        aria-label={`${isBetweenFirst ? "second filter upper bound" : isBetweenSecond ? "second filter lower bound" : "second filter value"} for ${props.label}`}
                        onKeyDown={blockInvalidNumberKeys}
                        onChange={(e) => {
                            const value = e.currentTarget.valueAsNumber;
                            setValue2(Number.isNaN(value) ? null : value);
                        }}
                    />
                </div>
            }
            {!isBetweenFirst && isBetweenSecond && (
                <div className="relative">
                    <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
                        <Icon className="material-symbols-outlined !text-lg leading-none">search</Icon>
                    </span>
                    <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
                        value={value3 ?? ""}
                        placeholder="To"
                        aria-label={`second filter upper bound for ${props.label}`}
                        onKeyDown={blockInvalidNumberKeys}
                        onChange={(e) => {
                            const value = e.currentTarget.valueAsNumber;
                            setValue3(Number.isNaN(value) ? null : value);
                        }}
                    />
                </div>
            )}
            <Button
                variant="primary"
                className="w-full mt-1"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFilter();
                }}
                disabled={isBetweenFirst ? !hasFirstValue || !hasSecondValue : !hasFirstValue || (isBetweenSecond && hasSecondValue && !hasThirdValue)}
                aria-label={`Apply numeric filter for ${props.label}`}
            >
                Filter
            </Button>
        </div>
    );
}