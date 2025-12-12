import { ColumnFilter } from "@tanstack/react-table";
import { useDebounce } from "hooks/useDebounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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
  const requireAccountFilter: boolean = lifecycleStage === LifecycleStageMap.PRICING || lifecycleStage === LifecycleStageMap.ACTIVITY;

  const router = useRouter();
  const pathName: string = usePathname();
  const searchParams: URLSearchParams = useSearchParams();

  const [selectedAccount, setSelectedAccount] = useState<SelectOptionType>(searchParams.size > 0 ? {
    label: decodeURIComponent(searchParams.get("label")),
    value: decodeURIComponent(searchParams.get("account")),
  } : null);
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
    // Update search params whenever selected account changes
    const params: URLSearchParams = new URLSearchParams(searchParams.toString());
    params.set("account", encodeURIComponent(newAccount.value));
    params.set("label", encodeURIComponent(newAccount.label));
    router.push(`${pathName}?${params.toString()}`);
  };

  // On first render, set filters and all other actions to update the account
  useEffect(() => {
    if (requireAccountFilter && selectedAccount != null) {
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
        // When no query params is available, set the first option as default selected account by pushing to the route
        if (selectedAccount == null && respOptions?.length > 0) {
          handleUpdateAccount(respOptions?.[0]);
        }
      } catch (error) {
        console.error("Error fetching instances", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (requireAccountFilter) {
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
