import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
import { Dictionary } from "types/dictionary";
import Button from "../button";
import SelectOption from "../input/select-option";
import { useState } from "react";

interface SearchSelectorProps {
  label: string;
  searchString: string;
  options: string[];
  initSelectedOptions: string[];
  onSubmission: (_options: string[]) => void;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * This component renders a dropdown selector with searching capabilities.
 *
 * @param {string} label The aria-label for the component.
 * @param {string} searchString The uncontrolled search option.
 * @param {string[]} options The options to be displayed.
 * @param {string[]} initSelectedOptions The initial options that have been selected.
 * @param onSubmission Function to be executed on submission.
 * @param setSearchString Dispatch function to set search string state.
 */
export default function SearchSelector(props: Readonly<SearchSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const { refreshFlag, triggerRefresh } = useRefresh(100);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(props.initSelectedOptions);

  // Focus on the input right after it is rendered
  // Alternative to useRef to avoid unnecessary re-renders
  const focusInput = (element: HTMLInputElement) => {
    if (element) {
      element.focus();
    }
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-2">
        <input
          ref={focusInput}
          type="text"
          className="border border-border rounded px-2 py-2 mb-1 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
          value={props.searchString}
          placeholder="Filter not listed? Start typing..."
          aria-label={"search input for " + props.label}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onChange={(event) => {
            props.setSearchString(event.target.value);
          }}
        />
        <Button
          leftIcon="send"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            props.onSubmission(selectedOptions);
          }}
          tooltipText={dict.action.submit}
          variant="primary"
          aria-label={"Submit for " + props.label}
        />
        {selectedOptions.length > 0 && <Button
          leftIcon="filter_list_off"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            triggerRefresh();
            setSelectedOptions([]);
          }}
          tooltipText={dict.action.clearAllFilters}
          variant="destructive"
          aria-label={"Clear all options for " + props.label}
        />}
      </div>
      <div className="max-h-60 overflow-y-auto">
        {!refreshFlag && props.options.map((option) => (
          <SelectOption
            key={option}
            option={option}
            initialChecked={selectedOptions.includes(option)}
            onClick={() => {
              if (selectedOptions.includes(option)) {
                setSelectedOptions(selectedOptions.filter((value) => value !== option));
              } else {
                const newOptions: string[] = [...selectedOptions, option];
                setSelectedOptions(newOptions);
              }
            }}
          />
        ))}
        {props.options.length === 0 && (
          <div className="text-sm text-foreground/80 italic p-2">
            {dict.message.noOptions}
          </div>
        )}
      </div>
    </>
  );
}
