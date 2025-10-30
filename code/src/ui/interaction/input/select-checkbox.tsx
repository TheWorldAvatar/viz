import { ComponentType } from "react";
import { GroupBase, OptionProps, components } from "react-select";
import { SelectOptionType } from "../dropdown/simple-selector";
import Checkbox from "./checkbox";

export const SelectCheckboxOption: ComponentType<OptionProps<SelectOptionType, boolean, GroupBase<SelectOptionType>>> = (props: OptionProps<SelectOptionType, boolean, GroupBase<SelectOptionType>>) => {
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
          ariaLabel={props.label}
          disabled={props.isDisabled}
        />
      </div>
    </components.Option>
  );
};
