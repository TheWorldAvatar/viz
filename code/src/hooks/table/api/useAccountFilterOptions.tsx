import { ColumnFilter } from "@tanstack/react-table";
import { useDebounce } from "hooks/useDebounce";
import React, { useEffect, useState } from "react";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface FilterOptionsDescriptor {
  options: SelectOptionType[];
  isLoading: boolean;
  selectedAccount: SelectOptionType;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateAccount: (_newAccount: SelectOptionType) => void;
}

/**
* A custom hook to retrieve the account specific filter options and additional states to query the filter options when required.
* 
* @param {string} accountType Type of account entity for rendering.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {ColumnFilter[]} allFilters Filter state for the entire table.
* @param {React.Dispatch<React.SetStateAction<ColumnFilter[]>>} setFilters Update the filter state.
*/
export function useAccountFilterOptions(
  accountType: string,
  lifecycleStage: LifecycleStage,
  allFilters: ColumnFilter[],
  setFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>,
): FilterOptionsDescriptor {
  const [selectedAccount, setSelectedAccount] = useState<SelectOptionType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<SelectOptionType[]>([]);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch: string = useDebounce<string>(search, 500);

  // A method to update the selected account on click in the selector
  const handleUpdateAccount = (newAccount: SelectOptionType) => {
    // First set the column filters in the table on click
    const otherFilters: ColumnFilter[] = allFilters.filter(f => f.id !== accountType);
    setFilters([
      ...otherFilters,
      // column filter is expected in the format {id: string, value: unknown}
      { id: accountType, value: [newAccount?.label] }
    ]);
    // Update the selected account state to propagate changes
    setSelectedAccount(newAccount);
    // Update local storage whenever selected account changes
    browserStorageManager.set(accountType, newAccount.value)
  };

  // On first render, set filters and all other actions to update the account
  useEffect(() => {
    if (lifecycleStage === LifecycleStageMap.ACTIVITY && selectedAccount != null) {
      handleUpdateAccount(selectedAccount);
    }
  }, []);

  //  A hook that refetches all data when the dialogs are closed and search term changes
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
          InternalApiIdentifierMap.FILTER,
          LifecycleStageMap.ACCOUNT,
          accountType,
          debouncedSearch,
        ));
        const respOptions: SelectOptionType[] = res.data?.items as SelectOptionType[];
        setOptions(respOptions);
        // When no account is set
        if (selectedAccount == null && respOptions?.length > 0) {
          // Set first option only as default if account ID is not given
          if (browserStorageManager.get(accountType) == null) {
            handleUpdateAccount(respOptions?.[0]);
          } else {
            // Set to the target option based on the account id
            const accountId: string = browserStorageManager.get(accountType);
            handleUpdateAccount(respOptions?.find(option => option.value == accountId));
          }

        }
      } catch (error) {
        console.error("Error fetching instances", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lifecycleStage === LifecycleStageMap.ACTIVITY) {
      fetchData();
    }
  }, [debouncedSearch]);

  return {
    options,
    isLoading,
    selectedAccount,
    setSearch,
    handleUpdateAccount,
  };
}
