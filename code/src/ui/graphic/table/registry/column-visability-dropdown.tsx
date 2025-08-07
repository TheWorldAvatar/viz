import { Column, Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form/dist/types/fields";

import MultivalueSelector from "ui/interaction/dropdown/multivalue-selector";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
import { parseWordsForLabels } from "utils/client-utils";

interface ColumnVisibilityDropdownProps {
  table: Table<FieldValues>;
}

/**
 * A dropdown component for toggling column visibility in a table.
 *
 * @param {Table<FieldValues>} props.table - The table instance containing columns.
 *
 */
export default function ColumnVisibilityDropdown(
  props: Readonly<ColumnVisibilityDropdownProps>
) {
  const columns: Column<FieldValues, unknown>[] = props.table.getAllLeafColumns();
  const options: SelectOption[] = columns.map((col) => ({
    label: parseWordsForLabels(col.id),
    value: col.id,
  }));

  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(null);

  useEffect(() => {
    if (selectedOptions) {
      columns.forEach((col) => {
        col.toggleVisibility(selectedOptions.some((opt) => opt.value == col.id));
      });
    }
  }, [selectedOptions])

  return (
    <div className="flex justify-end">
      <div className="md:w-[300px]">
        <MultivalueSelector
          title="Customise Columns"
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
