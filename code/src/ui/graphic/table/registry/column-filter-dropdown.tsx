import { Column } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Select, {
  components,
  MultiValue,
  OptionProps,
  ActionMeta,
  StylesConfig,
} from "react-select";
import { checkboxInputsSelectorStyles } from "ui/css/selector-style";

interface ColumnFilterDropdownProps {
  column: Column<FieldValues, unknown>;
  options: string[];
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
        className="mr-2"
      />
      <label>{props.label}</label>
    </div>
  </components.Option>
);

/**
 * A dropdown component for filtering table columns with checkboxes and search functionality.
 *
 * @param {Column} props.column - The column to filter.
 * @param {string[]} props.options - The options to display in the dropdown.
 */

export default function ColumnFilterDropdown(
  props: Readonly<ColumnFilterDropdownProps>
) {
  const dict: Dictionary = useDictionary();

  const columnOptions: ColumnOption[] = props.options.map((option) => ({
    label: option,
    value: option,
  }));

  // Check if filter is currently applied
  const hasActiveFilter = () => {
    const filterValue = props.column.getFilterValue() as string[] | undefined;
    return filterValue !== undefined && filterValue.length > 0;
  };

  // Check if an option is selected
  const isOptionSelected = (option: ColumnOption) => {
    const filterValue = props.column.getFilterValue() as string[] | undefined;
    // If filter is undefined, no options are selected (show all by default)
    if (filterValue === undefined) {
      return false;
    }

    return filterValue.includes(option.value);
  };

  const getValue = () => {
    const filterValue = props.column.getFilterValue() as string[] | undefined;
    // If filter is undefined, return empty array (no options selected)
    if (filterValue === undefined) {
      return [];
    }

    return columnOptions.filter((opt) => filterValue.includes(opt.value));
  };

  const handleChange = (
    newValue: MultiValue<ColumnOption>,
    _actionMeta: ActionMeta<ColumnOption>
  ) => {
    if (newValue) {
      const selectedOptions = newValue.map((opt) => opt.value);

      if (selectedOptions.length === 0) {
        // No options selected - show all records (no filter)
        props.column.setFilterValue(undefined);
      } else {
        // Some options selected - filter to show only those
        props.column.setFilterValue(selectedOptions);
      }
    } else {
      // No value - show all records
      props.column.setFilterValue(undefined);
    }
  };

  // Custom styles that change based on filter state
  const getCustomStyles = (): StylesConfig<ColumnOption, true> => {
    const baseStyles = checkboxInputsSelectorStyles;
    const isFiltered = hasActiveFilter();

    return {
      ...baseStyles,
      control: (provided, state) => ({
        ...baseStyles.control?.(provided, state),
        backgroundColor: isFiltered ? "var(--ring)" : "var(--background)",
        ":hover": {
          backgroundColor: isFiltered ? "var(--ring-hover)" : "var(--muted)",
        },
      }),
    };
  };

  return (
    <div className="w-full min-w-36">
      <Select
        options={columnOptions}
        value={getValue()}
        onChange={handleChange}
        isOptionSelected={isOptionSelected}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{ Option }}
        placeholder="Filter"
        noOptionsMessage={() => dict.message.noOptions}
        controlShouldRenderValue={false}
        isSearchable
        className="text-base"
        styles={getCustomStyles()}
      />
    </div>
  );
}
