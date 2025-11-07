import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "../button";
import SelectOption from "../input/select-option";

interface SearchSelectorProps {
  label: string;
  options: string[];
  initialOptionChecked: (_option: string) => boolean;
  onOptionChange: (_option: string) => void;
  onClear: () => void;
}

/**
 * This component renders a dropdown selector with searching capabilities.
 *
 * @param {string} label The aria-label for the component.
 * @param {string[]} options The options to be displayed.
 * @param initialOptionChecked Function to check if the option should be initially checked by taking the option value itself.
 * @param onOptionChange Function to handle changes for each individual option.
 * @param onClear Function to be executed when clearing selected options.
 */
export default function SearchSelector(props: Readonly<SearchSelectorProps>) {
  const dict: Dictionary = useDictionary();
  return (
    <>
      {props.options.length > 20 && <input
        type="text"
        placeholder="Filter not listed? Start typing..."
        aria-label={"Search input for " + props.label}
      />}
      {props.options.length > 0 && <Button
        leftIcon="filter_list_off"
        iconSize="medium"
        size="icon"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          props.onClear();

        }}
        tooltipText={dict.action.clearAllFilters}
        variant="destructive"
        aria-label={"Clear all filters for " + props.label}
      />}
      <div className="max-h-60 overflow-y-auto">
        {props.options.map((option) => (
          <SelectOption
            key={option}
            option={option}
            initialChecked={props.initialOptionChecked(option)}
            onClick={() => props.onOptionChange(option)}
          />
        ))}
      </div>
    </>
  );
}
