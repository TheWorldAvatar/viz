import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import { Dictionary } from "types/dictionary";
import { checkboxInputsSelectorStyles } from "ui/css/selector-style";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { SelectCheckboxOption } from "ui/interaction/input/select-checkbox";
import { parseWordsForLabels } from "utils/client-utils";

interface MultivalueDropdownProps {
  title: string;
  options: SelectOptionType[];
  toggleAll?: boolean;
  isActive?: boolean;
  isClearable?: boolean;
  controlledSelectedOptions?: SelectOptionType[];
  setControlledSelectedOptions?: React.Dispatch<
    React.SetStateAction<SelectOptionType[]>
  >;
}

/**
 * This component renders a dropdown selector with checkbox interactions using the react-select library for multi-value selections.
 *
 * @param {string} title - The display title for the input.
 * @param {SelectOptionType[]} options - Select options.
 * @param {boolean} toggleAll - Provides an additional option to select all options. Defaults to false.
 * @param {boolean} isActive - Renders different style to indicate the input is currently active. Defaults to false.
 * @param {boolean} isClearable - All values in the dropdown can be cleared with an additional input. Defaults to true.
 * @param {SelectOptionType[]} controlledSelectedOptions - Optional controlled state for the selected options.
 * @param setControlledSelectedOptions - Optional dispatch method to update selected options for further processing.
 */
export default function MultivalueSelector(
  props: Readonly<MultivalueDropdownProps>
) {
  const dict: Dictionary = useDictionary();
  const selectAllOption: SelectOptionType = {
    label: parseWordsForLabels(dict.title.allCol),
    value: "select-all",
  };

  const defaultOptions: SelectOptionType[] = props.toggleAll
    ? [selectAllOption, ...props.options]
    : props.options;
  // Use any existing option if it is provided
  const [selectedOptions, setSelectedOptions] = useState<SelectOptionType[]>(props.controlledSelectedOptions ? props.controlledSelectedOptions :
    props.toggleAll ? defaultOptions.filter(
      (option) =>
        option.value != "id" &&
        option.value != "event_id" &&
        option.value != "service_location" &&
        option.value != "select-all"
    ) : []);

  // Notify parent on initial mount if toggleAll is enabled
  // This useEffect updates the null state (In Column toggle component) on the first render
  useEffect(() => {
    if (props.toggleAll) {
      props.setControlledSelectedOptions?.(selectedOptions);
    }
  }, []);

  useEffect(() => {
    // Explicitly reset only for false value, as it is an optional prop that can return true
    if (props.isActive === false) {
      setSelectedOptions([]);
      // Notify parent about the reset
      props.setControlledSelectedOptions?.([]);
    }
  }, [props.isActive]);

  const handleChange = (
    newValue: SelectOptionType | MultiValue<SelectOptionType>,
    actionMeta: ActionMeta<SelectOptionType>
  ) => {
    const { action, option } = actionMeta;

    if (action === "select-option" && option == selectAllOption) {
      setSelectedOptions(defaultOptions);
      props.setControlledSelectedOptions(defaultOptions);
    } else if (action === "deselect-option" && option == selectAllOption) {
      setSelectedOptions([]);
      props.setControlledSelectedOptions([]);
    } else {
      const newSelectedOptions: SelectOptionType[] = newValue as SelectOptionType[];
      if (
        props.toggleAll &&
        action === "select-option" &&
        newSelectedOptions.length == defaultOptions.length - 1
      ) {
        newSelectedOptions.unshift(selectAllOption);
      } else if (
        action === "deselect-option" &&
        newSelectedOptions?.[0]?.value == selectAllOption.value
      ) {
        newSelectedOptions.shift();
      }
      setSelectedOptions(newSelectedOptions);
      props.setControlledSelectedOptions(newSelectedOptions);
    }
  };

  // Custom styles that change based on active state
  const getCustomStyles = (): StylesConfig<SelectOptionType, true> => {
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
