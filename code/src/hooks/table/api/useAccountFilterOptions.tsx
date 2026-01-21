import { ColumnFilter } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface FilterOptionsDescriptor {
  selectedAccount: SelectOptionType;
  handleUpdateAccount: (_newAccount: SelectOptionType) => void;
  getAccountFilterOptions: (_inputValue: string) => Promise<SelectOptionType[]>;
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
  const [selectedAccount, setSelectedAccount] = useState<SelectOptionType>(() => {
    if (lifecycleStage === LifecycleStageMap.ACTIVITY) {
      const storedAccountLabel = browserStorageManager.get(LifecycleStageMap.ACCOUNT);
      const storedAccountValue = browserStorageManager.get(accountType);
      if (storedAccountLabel && storedAccountValue) {
        return { label: storedAccountLabel, value: storedAccountValue };
      }
    }
    return null;
  });

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
    browserStorageManager.set(LifecycleStageMap.ACCOUNT, newAccount.label)
  };

  // A method to retrieve account filter options from the backend
  const getAccountFilterOptions = async (inputValue: string): Promise<SelectOptionType[]> => {
    try {
      const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
        InternalApiIdentifierMap.FILTER,
        LifecycleStageMap.ACCOUNT,
        accountType,
        inputValue
      ));
      return res.data?.items as SelectOptionType[];
    } catch (error) {
      console.error("Error fetching instances", error);
    }
  };

  useEffect(() => {
    // On first render, set filters and all other actions to update the account
    const init = async () => {
      let currentAccount: SelectOptionType = selectedAccount;
      // When no any account is found in session storage, get the options and set the first option into session storage
      if (currentAccount == null) {
        const options: SelectOptionType[] = await getAccountFilterOptions("");
        if (options?.length > 0) {
          currentAccount = options[0];
        }
      }
      handleUpdateAccount(currentAccount);
    };

    if (lifecycleStage === LifecycleStageMap.ACTIVITY) {
      init();
    }
  }, []);

  return {
    selectedAccount,
    handleUpdateAccount,
    getAccountFilterOptions,
  };
}
