import { useDebounce } from "@/hooks/useDebounce";
import { useDictionary } from "@/hooks/useDictionary";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStage, LifecycleStageMap } from "@/types/form";
import { parseColumnFiltersIntoUrlParams, parseTranslatedFieldToOriginal } from "@/ui/graphic/table/registry/registry-table-utils";
import { getAfterDelimiter, getUTCDate } from "@/utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { ColumnFilter } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export interface FilterOptionsDescriptor {
  options: string[];
  search: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentFilters: string[];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

/**
* A custom hook to retrieve the filter options and additional states to query the filter options when required.
* 
* @param {string} entityType Type of entity for rendering.
* @param {string} field The field name to find filters for.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {string[]} currentFilters The currently selected filter values.
* @param {ColumnFilter[]} allFilters Filter state for the entire table.
* @param {boolean} disable Disables the hook if true.
*/
export function useFilterOptions(
  entityType: string,
  field: string,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  currentFilters: string[],
  allFilters: ColumnFilter[],
  disable: boolean,
): FilterOptionsDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch: string = useDebounce<string>(search, 300);

  //  A hook that refetches all data when the dialogs are closed and search term changes
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const filterParams: string = parseColumnFiltersIntoUrlParams(allFilters, dict.title.blank, dict.title);
      try {
        // Fetch service tasks for a specific contract
        let url: string;
        if (
          lifecycleStage == LifecycleStageMap.SCHEDULED ||
          lifecycleStage == LifecycleStageMap.CLOSED
        ) {
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            debouncedSearch,
            filterParams,
            lifecycleStage,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
          );
        } else if (lifecycleStage == LifecycleStageMap.OUTSTANDING) {
          // Pass current local day for the end date
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            debouncedSearch,
            filterParams,
            lifecycleStage,
            null,
            getUTCDate(new Date()).getTime().toString(),
          );
        } else {
          let parsedStage: string = lifecycleStage;
          if (lifecycleStage == LifecycleStageMap.ACCOUNT ||
            lifecycleStage == LifecycleStageMap.PRICING ||
            lifecycleStage == LifecycleStageMap.INVOICE) {
            parsedStage = LifecycleStageMap.GENERAL;
          }
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            debouncedSearch,
            filterParams,
            parsedStage,
          );
        }
        const res: AgentResponseBody = await queryInternalApi(url);
        const resOptions: string[] = (res.data?.items as string[]).map(option =>
          field === "event_id" ? getAfterDelimiter(option, "/") : !option ? dict.title.blank : option);
        setOptions(resOptions);
      } catch (error) {
        console.error("Error fetching instances", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!disable) {
      fetchData();
    }
  }, [disable, debouncedSearch, entityType, field, lifecycleStage, selectedDate, dict.title]);

  return {
    options,
    search,
    isLoading,
    setIsLoading,
    currentFilters,
    setSearch,
  };
}
