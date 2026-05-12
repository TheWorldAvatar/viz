import { Icon } from "@mui/material";
import { useDictionary } from "hooks/useDictionary";
import { useState } from "react";
import { Dictionary } from "types/dictionary";
import { BetweenComparisonOption, BetweenComparisonOptionMap, ComparisonOperator, ComparisonOperatorMap } from "types/table";
import Button from "ui/interaction/button";
import SimpleSelector, { SelectOptionType } from "ui/interaction/dropdown/simple-selector";

interface NumericColumnFilterProps {
  label: string;
  onSubmission: (_options: string[]) => void;
}

/**
 * A numeric column filter component that allows filtering table data using one or two
 * numeric comparison conditions combined with AND/OR logic.
 *
 * @param {string} label The name of the column.
 * @param {void} onSubmission Function that submits the filtered options.
 */
export default function NumericColumnFilter(props: Readonly<NumericColumnFilterProps>) {
  const dict: Dictionary = useDictionary();
  const [value1, setValue1] = useState<number | null>(null);
  const [value2, setValue2] = useState<number | null>(null);
  const [selectedOperator1, setSelectedOperator1] = useState<ComparisonOperator>(ComparisonOperatorMap.EQUALS);
  const [betweenOption, setBetweenOption] = useState<BetweenComparisonOption>(BetweenComparisonOptionMap.INCLUSIVE);
  const [error, setError] = useState<string | null>(null);

  const hasFirstValue: boolean = value1 !== null && !Number.isNaN(value1);
  const hasSecondValue: boolean = value2 !== null && !Number.isNaN(value2);
  const isBetweenFirst: boolean = selectedOperator1 === ComparisonOperatorMap.BETWEEN;

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

    const isInvalidRange = betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? value2! <= value1! : value2! < value1!;
    if (isBetweenFirst && hasSecondValue && isInvalidRange) {
      setError(betweenOption === BetweenComparisonOptionMap.EXCLUSIVE
        ? "For 'between' (exclusive), the second value must be strictly greater than the first value."
        : "For 'between' (inclusive), the second value must be greater than or equal to the first value."
      );
      return;
    }

    const filterInfo: string[] = [];

    if (isBetweenFirst && hasSecondValue) {
      const lowerOp: Extract<ComparisonOperator, "gt" | "gte"> = betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? ComparisonOperatorMap.GREATER_THAN : ComparisonOperatorMap.GREATER_THAN_OR_EQUALS_TO;
      const upperOp: Extract<ComparisonOperator, "lt" | "lte"> = betweenOption === BetweenComparisonOptionMap.EXCLUSIVE ? ComparisonOperatorMap.LESS_THAN : ComparisonOperatorMap.LESS_THAN_OR_EQUALS_TO;
      // Results in: ["gte10", "lte20"]
      filterInfo.push(`${lowerOp}${value1}`);
      filterInfo.push(`${upperOp}${value2}`);
    } else {
      // Results in: ["eq500"]
      filterInfo.push(`${selectedOperator1}${value1}`);
    }

    props.onSubmission(filterInfo);
  }

  const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+"].includes(e.key)) {
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
            setValue2(null);
            setError(null);
          }
        }}
        ariaLabel="test"
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
          placeholder={isBetweenFirst ? dict.form.from : dict.title.value}
          aria-label={`${isBetweenFirst ? "Lower bound" : "Filter value"} for ${props.label}`}
          onKeyDown={blockInvalidNumberKeys}
          onChange={(e) => {
            const value = e.currentTarget.valueAsNumber;
            setValue1(Number.isNaN(value) ? null : value);
          }}
        />
      </div>

      {isBetweenFirst && (
        <>
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
              placeholder={dict.form.to}
              aria-label={`Upper bound for ${props.label}`}
              onKeyDown={blockInvalidNumberKeys}
              onChange={(e) => {
                const value = e.currentTarget.valueAsNumber;
                setValue2(Number.isNaN(value) ? null : value);
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 py-1">
            <input
              id="inclusive"
              type="radio"
              name="between-option"
              value="inclusive"
              checked={betweenOption === "inclusive"}
              onChange={() => setBetweenOption("inclusive")}
              className="accent-foreground"
            />
            <label htmlFor="inclusive" className="text-sm">
              {dict.title.inclusive}
            </label>
            <input
              id="exclusive"
              type="radio"
              name="between-option"
              value="exclusive"
              checked={betweenOption === "exclusive"}
              onChange={() => setBetweenOption("exclusive")}
              className="accent-foreground"
            />
            <label htmlFor="exclusive" className=" text-sm">
              {dict.title.exclusive}
            </label>
          </div>
        </>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        variant="primary"
        className="w-full mt-1"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleFilter();
        }}
        disabled={isBetweenFirst ? !hasFirstValue || !hasSecondValue : !hasFirstValue}
        aria-label={`Apply numeric filter for ${props.label}`}
      >
        {dict.action.filter}
      </Button>
    </div>
  );
}