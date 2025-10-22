import { ComponentType } from "react";
import { GroupBase, OptionProps, components } from "react-select";
import { SelectOption } from "../dropdown/simple-selector";
import Checkbox from "./checkbox";

export const SelectCheckboxOption: ComponentType<OptionProps<SelectOption, boolean, GroupBase<SelectOption>>> = (props: OptionProps<SelectOption, boolean, GroupBase<SelectOption>>) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.selectOption) {
      props.selectOption(props.data);
    }
  };

  return (
    <components.Option {...props}>
      <div className="flex items-center" onClick={handleClick}>
        <Checkbox
          checked={props.isSelected}
          onChange={() => null}
          className="mr-3"
          label={props.label}
        />
      </div>
    </components.Option>
  );
};
