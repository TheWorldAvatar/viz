import { useDictionary } from "hooks/useDictionary";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage } from "types/form";
import { parseTranslatedFieldToOriginal } from "ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface FilterOptionsDescriptor {
  options: string[];
  isLoading: boolean;
  showFilterDropdown: boolean;
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
*/
export function useFilterOptions(
  entityType: string,
  field: string,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
): FilterOptionsDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
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
            lifecycleStage,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
          );
        } else {
          url = makeInternalRegistryAPIwithParams(
            "filter",
            entityType,
            parseTranslatedFieldToOriginal(field, dict.title),
            lifecycleStage,
          );
        }
        const res: AgentResponseBody = await queryInternalApi(url);
        const resOptions: string[] = (res.data?.items as string[]).map(option => !option ? dict.title.blank : option);
        setOptions(resOptions);
      } catch (error) {
        console.error("Error fetching instances", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (triggerFetch && options.length === 0) {
      fetchData();
    }
  }, [triggerFetch]);

  return {
    options,
    isLoading,
    showFilterDropdown,
    setShowFilterDropdown,
    setTriggerFetch,
  };
}
