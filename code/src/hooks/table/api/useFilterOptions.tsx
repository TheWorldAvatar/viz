import React, { useEffect, useState } from "react";
import { AgentResponseBody } from "types/backend-agent";
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
*/
export function useFilterOptions(
  entityType: string,
  field: string,
): FilterOptionsDescriptor {
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
        const res: AgentResponseBody = await queryInternalApi(
          makeInternalRegistryAPIwithParams(
            "filter",
            entityType,
            field,

          ));
        setOptions(res.data?.items as string[]);
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
