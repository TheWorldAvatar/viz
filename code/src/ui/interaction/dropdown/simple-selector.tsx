import { useEffect, useMemo } from "react";
import Select, {
  ActionMeta,
  GroupBase,
  MultiValue,
  OptionsOrGroups,
  SingleValue,
} from "react-select";

import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { selectorStyles } from "ui/css/selector-style";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectValue<T extends SelectOption> =
  | SingleValue<T>
  | MultiValue<T>
  | null;

interface SimpleSelectorProps {
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>;
  defaultVal: string;
  onChange: (
    _value: SelectValue<SelectOption>,
    _actionMeta: ActionMeta<SelectOption>
  ) => void;
  noOptionMessage?: string;
  isDisabled?: boolean;
  reqNotApplicableOption?: boolean;
}

/**
 * This component renders a simple dropdown selector using the react-select library.
 *
 * @param {OptionsOrGroups<SelectOption, GroupBase<SelectOption>>} options The list of options to render.
 * @param {String} defaultVal The starting value of the selector.
 * @param onChange Function to handle the event when selecting a new element.
 * @param {string} noOptionMessage Optional message to display when no options are available. Defaults to an empty string.
 * @param {boolean} isDisabled Optional parameter to disable the selector. Defaults to false.
 * @param {boolean} reqNotApplicableOption Optional parameter to enable the not applicable option. Defaults to false.
 */
export default function SimpleSelector(props: Readonly<SimpleSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const naOption: SelectOption = { value: "", label: dict.message.na };

  // A function that adds the not applicable option at the start if required
  const addNAOption = (
    reqNotApplicableOption: boolean,
    options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>
  ): OptionsOrGroups<SelectOption, GroupBase<SelectOption>> => {
    if (reqNotApplicableOption) {
      return [naOption, ...options];
    }
    return options;
  };

  const parsedOptions: OptionsOrGroups<
    SelectOption,
    GroupBase<SelectOption>
  > = addNAOption(props.reqNotApplicableOption, props.options);

  // A function that flattens the list of options and groups into a single list of options
  const flattenOptions = (
    optionsOrGroups: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>
  ): SelectOption[] => {
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
  };

  const flattenedOptions: SelectOption[] = useMemo(
    () => flattenOptions(parsedOptions),
    [parsedOptions]
  );

  // This sets the NA option if required on first render
  useEffect(() => {
    if (
      props.reqNotApplicableOption &&
      (props.defaultVal === "" || props.defaultVal === undefined)
    ) {
      props.onChange(naOption, { action: "select-option", option: naOption });
    }
  }, [props.reqNotApplicableOption, naOption]);

  const getDefaultValue = (): SelectOption => {
    // If defaultVal is explicitly empty and NA option is required, use NA option
    if (
      (props.defaultVal === "" || props.defaultVal === undefined) &&
      props.reqNotApplicableOption
    ) {
      return naOption;
    }
    // Otherwise, find the matching option
    return flattenedOptions.find((option) => option.value === props.defaultVal);
  };

  return (
    <Select
      styles={selectorStyles}
      unstyled
      options={parsedOptions}
      value={getDefaultValue()}
      onChange={props.onChange}
      isLoading={false}
      isMulti={false}
      isSearchable={true}
      isDisabled={props.isDisabled}
      noOptionsMessage={() => props.noOptionMessage ?? ""}
    />
  );
}
