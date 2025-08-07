import { ComponentType } from "react";
import { GroupBase, OptionProps, components } from "react-select";
import { SelectOption } from "../dropdown/simple-selector";

export const SelectCheckboxOption: ComponentType<OptionProps<SelectOption, boolean, GroupBase<SelectOption>>> = (props: OptionProps<SelectOption, boolean, GroupBase<SelectOption>>) => (
  <components.Option {...props}>
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-3"
        readOnly
      />
      <label>{props.label}</label>
    </div>
  </components.Option>
);
