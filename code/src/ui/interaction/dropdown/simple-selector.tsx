import { useMemo } from 'react';
import Select, { ActionMeta, GroupBase, MultiValue, OptionsOrGroups, SingleValue } from 'react-select';
import { selectorStyles } from 'ui/css/selector-style';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectValue<T extends SelectOption> = SingleValue<T> | MultiValue<T> | null;

interface SimpleSelectorProps {
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  defaultVal: string;
  onChange: (_value: SelectValue<SelectOption>, _actionMeta: ActionMeta<SelectOption>) => void;
  noOptionMessage?: string;
  isDisabled?: boolean;
}

/**
 * This component renders a simple dropdown selector using the react-select library.
 * 
 * @param {OptionsOrGroups<SelectOption, GroupBase<SelectOption>>} options The list of options to render.
 * @param {String} defaultVal The starting value of the selector.
 * @param onChange Function to handle the event when selecting a new element.
 * @param {string} noOptionMessage Optional message to display when no options are available. Defaults to an empty string.
 * @param {boolean} isDisabled Optional parameter to disable the selector. Defaults to false.
 */
export default function SimpleSelector(props: Readonly<SimpleSelectorProps>) {
  // A function that flattens the list of options and groups into a single list of options
  const flattenOptions = (optionsOrGroups: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>): SelectOption[] => {
    const flattened: SelectOption[] = [];
    optionsOrGroups.forEach((option) => {
      // Detected that it is a group, recursively flatten its options
      if ("options" in option) {
        flattened.push(...flattenOptions(option.options));
      } else {
        flattened.push(option);
      }
    });
    return flattened;
  }
  const flattenedOptions: SelectOption[] = useMemo(() => flattenOptions(props.options),
    [props.options]);
  return (
    <Select
      styles={selectorStyles}
      unstyled
      options={props.options}
      value={flattenedOptions.find(option => option.value === props.defaultVal)}
      onChange={props.onChange}
      isLoading={false}
      isMulti={false}
      isSearchable={true}
      isDisabled={props.isDisabled}
      noOptionsMessage={() => props.noOptionMessage ?? ""}
    />
  );
}