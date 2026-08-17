import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { BetweenComparisonOption, BetweenComparisonOptionMap, ComparisonOperator, ComparisonOperatorMap } from "@/types/table";
import Button from "@/ui/interaction/button";
import SimpleSelector, { SelectOptionType } from "@/ui/interaction/dropdown/simple-selector";
import { interpolate } from "@/utils/client-utils";
import { useState } from "react";
import { getInitialFilters } from "../registry/registry-table-utils";

interface TimeColumnFilterProps {
    label: string;
    currentVal: string[];
    onSubmission: (_options: string[]) => void;
    disabled?: boolean;
}

/**
 * A time column filter component that allows filtering table data using one or two
 * time comparison conditions, including an inclusive/exclusive BETWEEN range.
 * Time values are handled in HH:mm format and sent to the backend as e.g. "eq09:45".
 *
 * @param {string} label The name of the column.
 * @param {string[]} currentVal The current value stored in the table filters.
 * @param {void} onSubmission Function that submits the filtered options.
 * @param {boolean} disabled An optional state to disable the filter.
 */
export default function TimeColumnFilter(props: Readonly<TimeColumnFilterProps>) {
    const dict: Dictionary = useDictionary();
    const initialFilterState: string[] = getInitialFilters(props.currentVal);
    // Use between when there is more than 2 by default
    const hasBetweenComparisonOperator: boolean = initialFilterState?.length > 2;
    const [error, setError] = useState<string | null>(null);

    const [value1, setValue1] = useState<string | null>(initialFilterState?.length ? initialFilterState[1] : null);
    const [value2, setValue2] = useState<string | null>(hasBetweenComparisonOperator ? initialFilterState[2] : null);

    const [selectedOperator, setSelectedOperator] = useState<ComparisonOperator>(
        hasBetweenComparisonOperator ? ComparisonOperatorMap.BETWEEN
            : initialFilterState?.length ?
                ComparisonOperatorMap[initialFilterState[0] as keyof typeof ComparisonOperatorMap]
                // Default
                : ComparisonOperatorMap.EQUALS);

    const [betweenOption, setBetweenOption] = useState<BetweenComparisonOption>(
        hasBetweenComparisonOperator && (ComparisonOperatorMap[initialFilterState[0] as keyof typeof ComparisonOperatorMap] == ComparisonOperatorMap.GREATER_THAN) ?
            BetweenComparisonOptionMap.EXCLUSIVE :
            BetweenComparisonOptionMap.INCLUSIVE);


    const hasFirstValue: boolean = value1 !== null && value1 !== "";
    const hasSecondValue: boolean = value2 !== null && value2 !== "";
    const isBetweenComparisonOperator: boolean = selectedOperator === ComparisonOperatorMap.BETWEEN;

    const operators: SelectOptionType[] = [
        { value: ComparisonOperatorMap.EQUALS, label: dict.title.exactlyAt, disabled: false, },
        { value: ComparisonOperatorMap.NOT_EQUALS, label: dict.title.notAt, disabled: false, },
        { value: ComparisonOperatorMap.GREATER_THAN, label: dict.title.after, disabled: false, },
        { value: ComparisonOperatorMap.GREATER_THAN_OR_EQUALS_TO, label: dict.title.atOrAfter, disabled: false, },
        { value: ComparisonOperatorMap.LESS_THAN, label: dict.title.before, disabled: false, },
        { value: ComparisonOperatorMap.LESS_THAN_OR_EQUALS_TO, label: dict.title.atOrBefore, disabled: false, },
        { value: ComparisonOperatorMap.BETWEEN, label: dict.title.between, disabled: false, },
    ]

    const handleFilter = (): void => {
        if (!hasFirstValue) return;
        setError(null);
        const queryParams: string[] = [];

        // For between comparisons, two params should be pushed
        if (isBetweenComparisonOperator && hasSecondValue) {
            // Validation step. HH:mm strings sort correctly lexicographically.
            if (betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? value2! <= value1! : value2! < value1!) {
                setError(betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ?
                    dict.message.invalidExclusiveRange :
                    dict.message.invalidInclusiveRange
                );
                return;
            }

            const lowerOp: Extract<ComparisonOperator, "gt" | "gte"> = betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? ComparisonOperatorMap.GREATER_THAN : ComparisonOperatorMap.GREATER_THAN_OR_EQUALS_TO;
            const upperOp: Extract<ComparisonOperator, "lt" | "lte"> = betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? ComparisonOperatorMap.LESS_THAN : ComparisonOperatorMap.LESS_THAN_OR_EQUALS_TO;
            queryParams.push(`${lowerOp}${value1}`);
            queryParams.push(`${upperOp}${value2}`);

            // All other comparisons should only contain one param
        } else {
            queryParams.push(`${selectedOperator}${value1}`);
        }

        props.onSubmission(queryParams);
    }

    const handleClearFilter = (): void => {
        setValue1(null);
        setValue2(null);
        setError(null);
        setSelectedOperator(ComparisonOperatorMap.EQUALS);
        props.onSubmission([]);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex space-x-1">
                <div className="w-100 md:w-40">
                    <SimpleSelector
                        options={operators}
                        defaultVal={selectedOperator}
                        onChange={(selected) => {
                            if (selected) {
                                setSelectedOperator((selected as SelectOptionType).value as ComparisonOperator);
                                setValue2(null);
                                setError(null);
                            }
                        }}
                        ariaLabel={interpolate(dict.action.selectItem, "operator")}
                    />
                </div>
                <Button
                    leftIcon="filter_alt"
                    iconSize="medium"
                    size="icon"
                    variant="primary"
                    className="p-5"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleFilter();
                    }}
                    tooltipText={dict.action.applyFilter}
                    disabled={(!hasFirstValue || (isBetweenComparisonOperator && !hasSecondValue)) || props.disabled}
                    aria-label={interpolate(dict.action.filterBy, props.label)}
                />
                <Button
                    leftIcon="filter_list_off"
                    iconSize="medium"
                    size="icon"
                    variant="secondary"
                    className="p-5 border border-border"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleClearFilter();
                    }}
                    tooltipText={dict.action.clearFilter}
                    disabled={(!hasFirstValue && !props.currentVal?.length) || props.disabled}
                    aria-label={interpolate(dict.action.clearFilterFor, props.label)}
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <input
                autoFocus
                type="time"
                className="border border-border rounded px-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-2"
                value={value1 ?? ""}
                aria-label={interpolate(isBetweenComparisonOperator ? dict.title.lowerBoundFor : dict.title.filterInputFor, props.label)}
                onChange={(event) => setValue1(event.target.value)}
            />

            {isBetweenComparisonOperator && (
                <>
                    <input
                        type="time"
                        className="border border-border rounded px-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-2"
                        value={value2 ?? ""}
                        aria-label={interpolate(dict.title.upperBoundFor, props.label)}
                        onChange={(event) => setValue2(event.target.value)}
                    />
                    <div className="flex items-center justify-center gap-2 py-1">
                        <input
                            id="inclusive"
                            type="radio"
                            name="between-option"
                            value={BetweenComparisonOptionMap.INCLUSIVE}
                            checked={betweenOption === BetweenComparisonOptionMap.INCLUSIVE}
                            onChange={() => setBetweenOption(BetweenComparisonOptionMap.INCLUSIVE)}
                            className="accent-foreground"
                        />
                        <label htmlFor="inclusive" className="text-sm">
                            {dict.title.inclusive}
                        </label>
                        <input
                            id="exclusive"
                            type="radio"
                            name="between-option"
                            value={BetweenComparisonOptionMap.EXCLUSIVE}
                            checked={betweenOption === BetweenComparisonOptionMap.EXCLUSIVE}
                            onChange={() => setBetweenOption(BetweenComparisonOptionMap.EXCLUSIVE)}
                            className="accent-foreground"
                        />
                        <label htmlFor="exclusive" className=" text-sm">
                            {dict.title.exclusive}
                        </label>
                    </div>
                </>
            )}
        </div>
    );
}
