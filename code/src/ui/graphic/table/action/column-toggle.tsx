import { Column } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { Dictionary } from "types/dictionary";

import MultivalueSelector from "ui/interaction/dropdown/multivalue-selector";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
import { parseWordsForLabels } from "utils/client-utils";

interface ColumnToggleProps {
  columns: Column<FieldValues, unknown>[];
}

/**
 * A selector component to show/hide the columns in a table.
 *
 * @param {Column<FieldValues, unknown>[]} columns - The list of all columns in the table.
 *
 */
export default function ColumnToggle(props: Readonly<ColumnToggleProps>) {
  const dict: Dictionary = useDictionary();
  const options: SelectOption[] = props.columns.map((col) => ({
    label: parseWordsForLabels(col.id),
    value: col.id,
  }));

  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(null);

  useEffect(() => {
    if (selectedOptions) {
      props.columns.forEach((col) => {
        col.toggleVisibility(
          selectedOptions.some((opt) => opt.value == col.id)
        );
      });
    }
  }, [selectedOptions]);

  return (
    <div className="flex justify-end">
      <div className="md:w-[300px] ">
        <MultivalueSelector
          title={dict.title.customiseCol}
          options={options}
          toggleAll={true}
          isClearable={false}
          setControlledSelectedOptions={setSelectedOptions}
          isAllInitiallySelected={true}
        />
      </div>
    </div>
  );
}
