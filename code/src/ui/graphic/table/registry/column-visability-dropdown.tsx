import { Table } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { parseWordsForLabels } from "utils/client-utils";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Select, {
  components,
  MultiValue,
  OptionProps,
  ActionMeta,
} from "react-select";
import { checkboxInputsSelectorStyles } from "ui/css/selector-style";
import { useCallback, useMemo } from "react";

interface ColumnVisibilityDropdownProps {
  table: Table<FieldValues>;
}

interface ColumnOption {
  label: string;
  value: string;
}

const selectAllOption = {
  value: "select-all",
  label: "All Columns",
} as const;

const Option = (props: OptionProps<ColumnOption, true>) => (
  <components.Option {...props}>
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-3"
      />
      <label>{props.label}</label>
    </div>
  </components.Option>
);

/**
 * A dropdown component for toggling column visibility in a table.
 *
 * @param {Table<FieldValues>} props.table - The table instance containing columns.
 *
 */

export default function ColumnVisibilityDropdown(
  props: Readonly<ColumnVisibilityDropdownProps>
) {
  const dict: Dictionary = useDictionary();

  const columns = useMemo(() => props.table.getAllLeafColumns(), [props.table]);
  const columnOptions: ColumnOption[] = useMemo(
    () =>
      columns.map((col) => ({
        label: parseWordsForLabels(col.id),
        value: col.id,
      })),
    [columns]
  );

  // Get only the currently visible columns
  const visibleColumns = columnOptions.filter((opt) =>
    props.table.getColumn(opt.value)?.getIsVisible()
  );

  // Check if all columns are selected
  const isAllColumnsSelected = () =>
    visibleColumns.length === columnOptions.length;

  // Check if an option is selected (including when Select All is active)
  const isOptionSelected = useCallback(
    (option: ColumnOption) => {
      if (option.value === selectAllOption.value) {
        return isAllColumnsSelected();
      }
      return props.table.getColumn(option.value)?.getIsVisible() || false;
    },
    [isAllColumnsSelected, props.table]
  );

  const allOptions = () => [selectAllOption, ...columnOptions];

  const selectedValue = () =>
    isAllColumnsSelected() ? [selectAllOption] : visibleColumns;

  const handleChange = (
    newValue: MultiValue<ColumnOption>,
    actionMeta: ActionMeta<ColumnOption>
  ) => {
    const { action, option, removedValue } = actionMeta;

    if (action === "select-option" && option?.value === selectAllOption.value) {
      // Select All was clicked - make all columns visible
      columns.forEach((col) => col.toggleVisibility(true));
    } else if (
      (action === "deselect-option" &&
        option?.value === selectAllOption.value) ||
      (action === "remove-value" &&
        removedValue?.value === selectAllOption.value)
    ) {
      // Select All was deselected - hide all columns
      columns.forEach((col) => col.toggleVisibility(false));
    } else if (
      actionMeta.action === "deselect-option" &&
      isAllColumnsSelected()
    ) {
      const deselectedColumn = props.table.getColumn(option?.value || "");
      if (deselectedColumn) {
        deselectedColumn.toggleVisibility(false);
      }
    } else {
      if (newValue) {
        // Set all columns to invisible first
        columns.forEach((col) => col.toggleVisibility(false));
        // Set selected columns to visible
        newValue.forEach((opt) => {
          if (opt.value !== selectAllOption.value) {
            props.table.getColumn(opt.value)?.toggleVisibility(true);
          }
        });
      }
    }
  };

  return (
    <div className="flex justify-end">
      <div className="md:w-[300px]">
        <Select
          options={allOptions()}
          value={selectedValue()}
          onChange={handleChange}
          isOptionSelected={isOptionSelected}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          components={{ Option }}
          placeholder="Customise Columns"
          noOptionsMessage={() => dict.message.noColumns}
          controlShouldRenderValue={false}
          isSearchable
          className="text-base"
          isClearable={false}
          styles={checkboxInputsSelectorStyles}
        />
      </div>
    </div>
  );
}
