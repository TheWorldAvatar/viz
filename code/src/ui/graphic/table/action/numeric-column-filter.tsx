import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { Dictionary } from "types/dictionary";
import { BetweenComparisonOption, BetweenComparisonOptionMap, ComparisonOperator, ComparisonOperatorMap } from "types/table";
import Button from "ui/interaction/button";
import SimpleSelector, { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import NumberInput from "ui/interaction/input/number-input";
import { interpolate } from "utils/client-utils";
import { getInitialNumericFilter } from "../registry/registry-table-utils";

interface NumericColumnFilterProps {
  label: string;
  currentVal: string[];
  onSubmission: (_options: string[]) => void;
}

/**
 * A numeric column filter component that allows filtering table data using one or two
 * numeric comparison conditions combined with AND/OR logic.
 *
 * @param {string} label The name of the column.
 * @param {string[]} currentVal The current value stored in the table filters.
 * @param {void} onSubmission Function that submits the filtered options.
 */
export default function NumericColumnFilter(props: Readonly<NumericColumnFilterProps>) {
  const dict: Dictionary = useDictionary();
  const initialFilterState: string[] = getInitialNumericFilter(props.currentVal);
  // Use between when there is more than 2 by default
  const hasBetweenComparisonOperator: boolean = initialFilterState?.length > 2;
  const [error, setError] = useState<string | null>(null);

  const [value1, setValue1] = useState<string | null>(initialFilterState ? initialFilterState[1] : null);
  const [value2, setValue2] = useState<string | null>(hasBetweenComparisonOperator ? initialFilterState[2] : null);

  const [selectedOperator1, setSelectedOperator1] = useState<ComparisonOperator>(
    hasBetweenComparisonOperator ? ComparisonOperatorMap.BETWEEN
      : initialFilterState ?
        ComparisonOperatorMap[initialFilterState[0] as keyof typeof ComparisonOperatorMap]
        // Default
        : ComparisonOperatorMap.EQUALS);

  const [betweenOption, setBetweenOption] = useState<BetweenComparisonOption>(
    hasBetweenComparisonOperator && (ComparisonOperatorMap[initialFilterState[0] as keyof typeof ComparisonOperatorMap] == ComparisonOperatorMap.GREATER_THAN) ?
      BetweenComparisonOptionMap.EXCLUSIVE :
      BetweenComparisonOptionMap.INCLUSIVE);


  const hasFirstValue: boolean = value1 !== null && !Number.isNaN(value1);
  const hasSecondValue: boolean = value2 !== null && !Number.isNaN(value2);
  const isBetweenComparisonOperator: boolean = selectedOperator1 === ComparisonOperatorMap.BETWEEN;

  const operators: SelectOptionType[] = [
    { value: ComparisonOperatorMap.EQUALS, label: dict.title.equal, disabled: false, },
    { value: ComparisonOperatorMap.NOT_EQUALS, label: dict.title.notEqual, disabled: false, },
    { value: ComparisonOperatorMap.GREATER_THAN, label: dict.title.greaterThan, disabled: false, },
    { value: ComparisonOperatorMap.GREATER_THAN_OR_EQUALS_TO, label: dict.title.greaterThanOrEqual, disabled: false, },
    { value: ComparisonOperatorMap.LESS_THAN, label: dict.title.lessThan, disabled: false, },
    { value: ComparisonOperatorMap.LESS_THAN_OR_EQUALS_TO, label: dict.title.lessThanOrEqual, disabled: false, },
    { value: ComparisonOperatorMap.BETWEEN, label: dict.title.between, disabled: false, },
  ]

  const handleFilter = (): void => {
    if (!hasFirstValue) return;
    setError(null);
    const queryParams: string[] = [];

    // For between comparisons, two params should be pushed
    if (isBetweenComparisonOperator && hasSecondValue) {
      // Validation step
      if (betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? Number(value2!) <= Number(value1!) : Number(value2!) < Number(value1!)) {
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
      queryParams.push(`${selectedOperator1}${value1}`);
    }

    props.onSubmission(queryParams);
  }

  return (
    <div className="flex flex-col w-62 gap-2">
      <div className="flex w-62 space-x-1">
        <div className="w-100">
          <SimpleSelector
            options={operators}
            defaultVal={selectedOperator1}
            onChange={(selected) => {
              if (selected) {
                setSelectedOperator1((selected as SelectOptionType).value as ComparisonOperator);
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
          className="h-full w-12"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleFilter();
          }}
          tooltipText={dict.action.applyFilter}
          disabled={!hasFirstValue || (isBetweenComparisonOperator && !hasSecondValue)}
          aria-label={interpolate(dict.action.filterBy, props.label)}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="relative">
        <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
          <Icon className="material-symbols-outlined text-lg! leading-none">search</Icon>
        </span>
        <NumberInput
          autoFocus
          inputMode="decimal"
          className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-2"
          value={value1}
          placeholder={isBetweenComparisonOperator ? dict.form.from : dict.title.value}
          aria-label={interpolate(isBetweenComparisonOperator ? dict.title.lowerBoundFor : dict.title.filterInputFor, props.label)}
          onInputChange={setValue1}
        />
      </div>

      {isBetweenComparisonOperator && (
        <>
          <div className="relative">
            <span className="absolute left-2 inset-y-0 flex items-center text-muted-foreground">
              <Icon className="material-symbols-outlined text-lg! leading-none">search</Icon>
            </span>
            <NumberInput
              autoFocus
              inputMode="decimal"
              className="border border-border rounded pl-8 pr-3 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-2"
              value={value2}
              placeholder={dict.form.to}
              aria-label={interpolate(dict.title.upperBoundFor, props.label)}
              onInputChange={setValue2}
            />
          </div>
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