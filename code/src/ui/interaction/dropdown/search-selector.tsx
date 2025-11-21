import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
import { useState } from "react";
import { Dictionary } from "types/dictionary";
import StatusComponent from "ui/text/status/status";
import Button from "../button";
import SelectOption from "../input/select-option";

interface SearchSelectorProps {
  label: string;
  searchString: string;
  options: string[];
  initSelectedOptions: string[];
  showOptions: boolean;
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
 * @param {boolean} showOptions Shows the options if true. Used to indicate if options are fetching.
 * @param onSubmission Function to be executed on submission.
 * @param setSearchString Dispatch function to set search string state.
 */
export default function SearchSelector(props: Readonly<SearchSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const { refreshFlag, triggerRefresh } = useRefresh(100);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(props.initSelectedOptions);

  return (
    <>
      <div className="flex flex-row items-end justify-between gap-1.5">
        <div className="relative flex-1 ">
          <input
            autoFocus
            type="text"
            className="border border-border rounded pl-3 pr-14 py-2 w-full outline-none focus-visible:ring-zinc-400 focus-visible:ring-[2px]"
            value={props.searchString}
            placeholder={dict.message.typeFilter}
            aria-label={"search input for " + props.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onChange={(event) => {
              props.setSearchString(event.target.value);
            }}
          />
          <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
            <Button
              leftIcon="filter_alt"
              iconSize="medium"
              size="icon"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onSubmission(selectedOptions);
              }}
              tooltipText={dict.action.applyFilter}
              variant="primary"
              className="h-full rounded-l-none w-12"
              aria-label={"Submit for " + props.label}
            />
          </div>
        </div>
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
        {props.showOptions && <p className="text-sm text-foreground/80 italic px-2">
          {props.options.length === 0 && dict.message.noOptions}
          {props.options.length > 20 && dict.message.typeMore}
        </p>}
        {props.showOptions && !refreshFlag && props.options.map((option, index) => (
          <SelectOption
            key={option + index}
            option={props.label === "status" ? dict.title[option.toLowerCase()] : option}
            labelComponent={props.label === "status" ? <StatusComponent status={option} /> : null}
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
      </div>
    </>
  );
}
