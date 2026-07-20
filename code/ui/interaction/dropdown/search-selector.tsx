import { useDictionary } from "@/hooks/useDictionary";
import useRefresh from "@/hooks/useRefresh";
import { Dictionary } from "@/types/dictionary";
import StatusComponent from "@/ui/text/status/status";
import { useState } from "react";
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
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
 * @param setIsLoading State function to set loading state.
 * @param {boolean} disabled An optional state to disable the filter.
 */
export default function SearchSelector(props: Readonly<SearchSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const { refreshFlag, triggerRefresh } = useRefresh(100);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(props.initSelectedOptions);

  return (
    <div className="w-full sm:w-sm xl:w-lg">
      <div className="flex flex-row items-stretch justify-between gap-1.5 mb-1">
        <div className="flex flex-1 items-stretch">
          <input
            autoFocus
            type="text"
            className="border border-border rounded pl-3 py-2 w-full outline-none focus-visible:ring-focus focus-visible:ring-2"
            value={props.searchString}
            placeholder={dict.message.typeFilter}
            aria-label={"search input for " + props.label}
            disabled={props.disabled}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onChange={(event) => {
              props.setSearchString(event.target.value);
            }}
          />
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
            className="h-full w-12 border border-border ml-2"
            disabled={props.disabled || selectedOptions?.length == 0}
            aria-label={"Submit for " + props.label}
          />
        </div>
        {selectedOptions.length > 0 && <Button
          leftIcon="indeterminate_check_box"
          iconSize="medium"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            triggerRefresh();
            setSelectedOptions([]);
            if (props.searchString.length > 0) {
              props.setIsLoading(true);
              props.setSearchString("");
            }
          }}
          variant="secondary"
          className="p-5 border border-border"
          disabled={props.disabled}
          tooltipText={dict.action.clear}
          aria-label={dict.action.clear}
        />}
      </div>
      <div className="max-h-80 w-full overflow-y-auto overflow-x-auto">
        {props.showOptions && <p className="text-sm text-foreground/80 italic px-2 my-1">
          {props.options.length === 0 && dict.message.noOptions}
          {props.options.length > 20 && dict.message.typeMore}
        </p>}
        {props.showOptions && !refreshFlag && props.options.map((option, index) => (
          <SelectOption
            key={option + index}
            option={props.label === dict.title.status ? dict.title[option.toLowerCase()] :
              props.label === "scheduleType" ? dict.form[option] : option}
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
        <p className="text-2xl text-foreground/80 italic px-2">
          {props.options.length > 20 && "..."}
        </p>
      </div>
    </div>
  );
}
