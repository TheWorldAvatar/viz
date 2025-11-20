import { ColumnFilter } from "@tanstack/react-table";
import { useDebounce } from "hooks/useDebounce";
import { useDictionary } from "hooks/useDictionary";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage } from "types/form";
import { parseColumnFiltersIntoUrlParams, parseTranslatedFieldToOriginal } from "ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface FilterOptionsDescriptor {
  options: string[];
  search: string;
  isLoading: boolean;
  showFilterDropdown: boolean;
  currentFilters: string[];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setShowFilterDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setTriggerFetch: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
* A custom hook to retrieve the filter options and additional states to query the filter options when required.
* 
* @param {string} entityType Type of entity for rendering.
* @param {string} field List of parameters for sorting.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {string[]} currentFilters The currently selected filter values.
* @param {ColumnFilter[]} allFilters Filter state for the entire table.
*/
export function useFilterOptions(
  entityType: string,
  field: string,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  currentFilters: string[],
  allFilters: ColumnFilter[],
): FilterOptionsDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch: string = useDebounce<string>(search, 500);

  //  A hook that refetches all data when the dialogs are closed and search term changes
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const filterParams: string = parseColumnFiltersIntoUrlParams(allFilters, dict.title.blank, dict.title);
      try {
        // Fetch service tasks for a specific contract
        let url: string;
        if (
          lifecycleStage == "scheduled" ||
          lifecycleStage == "closed"
        ) {
          url = makeInternalRegistryAPIwithParams(
            "filter",
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            debouncedSearch,
            filterParams,
            lifecycleStage,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
          );
        } else {
          url = makeInternalRegistryAPIwithParams(
            "filter",
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            debouncedSearch,
            filterParams,
            lifecycleStage,
          );
        }
        const res: AgentResponseBody = await queryInternalApi(url);
        const resOptions: string[] = (res.data?.items as string[]).map(option =>
          field === "status" ? dict.title[option.toLowerCase()] :
            !option ? dict.title.blank : option);

        // Merge selected filters with fetched options to ensure selected items are always visible
        // Use set to avoid duplicates
        const mergedOptions: string[] = [...new Set([...currentFilters, ...resOptions])];
        setOptions(mergedOptions);
      } catch (error) {
        console.error("Error fetching instances", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (triggerFetch) {
      fetchData();
    }
  }, [triggerFetch, debouncedSearch, entityType, field, lifecycleStage, selectedDate, dict.title]);

  return {
    options,
    search,
    isLoading,
    showFilterDropdown,
    currentFilters,
    setSearch,
    setShowFilterDropdown,
    setTriggerFetch,
  };
}
