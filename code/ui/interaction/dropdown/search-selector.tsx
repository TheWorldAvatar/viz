import { useConnected } from "@/hooks/useConnected";
import { useDictionary } from "@/hooks/useDictionary";
import useRefresh from "@/hooks/useRefresh";
import { Dictionary } from "@/types/dictionary";
import { ColFilterValues } from "@/types/table";
import LoadingSpinner from "@/ui/graphic/loader/spinner";
import StatusComponent from "@/ui/text/status/status";
import { Filter, SquareMinus } from "lucide-react";
import { useState } from "react";
import Button from "../button";
import SelectOption from "../input/select-option";


interface SearchSelectorProps {
  label: string;
  searchString: string;
  options: string[];
  initSelectedOptions: ColFilterValues;
  onSubmission: (_options: string[], _isIncluded: boolean) => void;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  className?: string;
}

/**
 * This component renders a dropdown selector with searching capabilities.
 *
 * @param {string} label The aria-label for the component.
 * @param {string} searchString The uncontrolled search option.
 * @param {string[]} options The options to be displayed.
 * @param {ColFilterValues} initSelectedOptions The initial options that have been selected.
 * @param onSubmission Function to be executed on submission.
 * @param setSearchString Dispatch function to set search string state.
 * @param {boolean} isLoading The loading state to indicate if options are fetching.
 * @param setIsLoading State function to set loading state.
 * @param {boolean} disabled An optional state to disable the filter.
 * @param {string} className Optional additional styling applied to the selector.
 */
export default function SearchSelector(props: Readonly<SearchSelectorProps>) {
  const dict: Dictionary = useDictionary();
  const isConnected: boolean = useConnected();
  const { refreshFlag, triggerRefresh } = useRefresh(100);
  const [isIncluded, setIsIncluded] = useState<boolean>(props.initSelectedOptions.isIncluded);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(props.initSelectedOptions.values);
  const [pinnedOptions, setPinnedOptions] = useState<string[]>(props.initSelectedOptions.values);
  const [previousOptions, setPreviousOptions] = useState<string[]>(props.options);

  if (props.options !== previousOptions) {
    setPreviousOptions(props.options);
    setPinnedOptions(selectedOptions);
  }

  const visibleOptions: string[] = [...new Set([...pinnedOptions, ...props.options, ...selectedOptions])];

  return (
    <div className={`w-full ${props.className ?? "md:w-sm xl:w-lg"}`}>
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
            leftIcon={Filter}
            size="icon"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              props.onSubmission(selectedOptions, isIncluded);
            }}
            tooltipText={dict.action.applyFilter}
            variant="primary"
            className="p-5 border border-border ml-2"
            disabled={props.disabled || !isConnected}
            aria-label={"Submit for " + props.label}
          />
        </div>
        {selectedOptions.length > 0 && <Button
          leftIcon={SquareMinus}
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
        {props.isLoading && (
          <div role="status" aria-live="polite" className="p-2.5 mt-2">
            <LoadingSpinner size="md" />
            <span className="sr-only">{dict.message.loading}</span>
          </div>
        )}
        {!props.isLoading && <p className="text-sm text-foreground/80 italic px-2 my-1">
          {visibleOptions.length === 0 && dict.message.noOptions}
          {visibleOptions.length > 20 && dict.message.typeMore}
        </p>}
        {!props.isLoading && visibleOptions.length > 0 && <div className={"flex justify-center bg-ring"}>
          <Button
            label={dict.action.include}
            hasMobileIcon={false}
            variant={isIncluded ? "active" : "ghost"}
            className="w-full sm:w-auto"
            onClick={() => {
              setIsIncluded(true);
            }}
          />
          <Button
            label={dict.action.exclude}
            hasMobileIcon={false}
            variant={!isIncluded ? "active" : "ghost"}
            className="w-full sm:w-auto"
            onClick={() => {
              setIsIncluded(false);
            }}
          />
        </div>
        }
        {!props.isLoading && !refreshFlag && visibleOptions.map((option, index) => (
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
          {visibleOptions.length > 20 && "..."}
        </p>
      </div>
    </div>
  );
}
