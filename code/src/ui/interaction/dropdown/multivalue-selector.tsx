import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import { Dictionary } from "types/dictionary";
import { checkboxInputsSelectorStyles } from "ui/css/selector-style";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
import { SelectCheckboxOption } from "ui/interaction/input/select-checkbox";
import { parseWordsForLabels } from "utils/client-utils";

interface MultivalueDropdownProps {
  title: string;
  options: SelectOption[];
  toggleAll?: boolean;
  isActive?: boolean;
  isAllInitiallySelected?: boolean;
  isClearable?: boolean;
  excludeFromInitial?: string[];
  setControlledSelectedOptions?: React.Dispatch<
    React.SetStateAction<SelectOption[]>
  >;
}

/**
 * This component renders a dropdown selector with checkbox interactions using the react-select library for multi-value selections.
 *
 * @param {string} title - The display title for the input.
 * @param {SelectOption[]} options - Select options.
 * @param {boolean} toggleAll - Provides an additional option to select all options. Defaults to false.
 * @param {boolean} isActive - Renders different style to indicate the input is currently active. Defaults to false.
 * @param {boolean} isAllInitiallySelected - Ensures all options are selected if set to true on first render. Defaults to false.
 * @param {boolean} isClearable - All values in the dropdown can be cleared with an additional input. Defaults to true.
 * @param {string[]} excludeFromInitial - Array of option values to exclude from initial selection when isAllInitiallySelected is true.
 * @param setControlledSelectedOptions - Optional dispatch method to update selected options for further processing.
 *
 */
export default function MultivalueSelector(
  props: Readonly<MultivalueDropdownProps>
) {
  const dict: Dictionary = useDictionary();
  const selectAllOption: SelectOption = {
    label: parseWordsForLabels(dict.title.allCol),
    value: "select-all",
  };

  const defaultOptions: SelectOption[] = props.toggleAll
    ? [selectAllOption, ...props.options]
    : props.options;

  // Get initial selection based on props
  const getInitialSelection = (): SelectOption[] => {
    if (props.excludeFromInitial && props.excludeFromInitial.length > 0) {
      return props.options.filter(
        (option) => !props.excludeFromInitial.includes(option.value)
      );
    }

    if (props.isAllInitiallySelected) {
      return defaultOptions;
    }
    return [];
  };

  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(
    getInitialSelection()
  );

  // Notify parent of initial selection on mount
  useEffect(() => {
    const initialSelection = getInitialSelection();
    props.setControlledSelectedOptions?.(initialSelection);
  }, []);

  useEffect(() => {
    // Explicitly reset only for false value, as it is an optional prop that can return true
    if (props.isActive === false) {
      setSelectedOptions([]);
      props.setControlledSelectedOptions?.([]);
    }
  }, [props.isActive]);

  const handleChange = (
    newValue: SelectOption | MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    const { action, option } = actionMeta;

    if (action === "select-option" && option == selectAllOption) {
      setSelectedOptions(defaultOptions);
      props.setControlledSelectedOptions(defaultOptions);
    } else if (action === "deselect-option" && option == selectAllOption) {
      setSelectedOptions([]);
      props.setControlledSelectedOptions([]);
    } else {
      const newSelectedOptions: SelectOption[] = newValue as SelectOption[];
      if (
        props.toggleAll &&
        action === "select-option" &&
        newSelectedOptions.length == defaultOptions.length - 1
      ) {
        newSelectedOptions.unshift(selectAllOption);
      } else if (
        action === "deselect-option" &&
        newSelectedOptions[0].value == selectAllOption.value
      ) {
        newSelectedOptions.shift();
      }
      setSelectedOptions(newSelectedOptions);
      props.setControlledSelectedOptions(newSelectedOptions);
    }
  };

  // Custom styles that change based on active state
  const getCustomStyles = (): StylesConfig<SelectOption, true> => {
    const baseStyles = checkboxInputsSelectorStyles;
    return {
      ...baseStyles,
      control: (provided, state) => ({
        ...baseStyles.control?.(provided, state),
        backgroundColor: props.isActive ? "var(--ring)" : "var(--background)",
        ":hover": {
          backgroundColor: props.isActive
            ? "var(--ring-hover)"
            : "var(--muted)",
        },
      }),
    };
  };

  return (
    <Select
      options={defaultOptions}
      value={selectedOptions}
      onChange={handleChange}
      isMulti
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      components={{ Option: SelectCheckboxOption }}
      placeholder={props.title}
      noOptionsMessage={() => dict.message.noOptions}
      controlShouldRenderValue={false}
      isSearchable
      className="text-base"
      isClearable={props.isClearable ?? true}
      styles={getCustomStyles()}
    />
  );
}
