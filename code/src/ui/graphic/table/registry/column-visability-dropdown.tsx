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

interface ColumnVisibilityDropdownProps {
  table: Table<FieldValues>;
}

interface ColumnOption {
  label: string;
  value: string;
}

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

  const columns = props.table.getAllLeafColumns();
  const options: ColumnOption[] = columns.map((col) => ({
    label: parseWordsForLabels(col.id),
    value: col.id,
  }));

  // Get only the currently visible columns
  const selectedOptions = options.filter((opt) =>
    props.table.getColumn(opt.value)?.getIsVisible()
  );

  const selectAllOption = {
    value: "select-all",
    label: "All Columns",
  };

  const isSelectAllSelected = () => selectedOptions.length === options.length;

  // Check if an option is selected (including when Select All is active)
  const isOptionSelected = (option: ColumnOption) => {
    if (option.value === selectAllOption.value) {
      return isSelectAllSelected();
    }
    return props.table.getColumn(option.value)?.getIsVisible() || false;
  };

  const getOptions = () => [selectAllOption, ...options];

  const getValue = () =>
    isSelectAllSelected() ? [selectAllOption] : selectedOptions;

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
      isSelectAllSelected()
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
          options={getOptions()}
          value={getValue()}
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
