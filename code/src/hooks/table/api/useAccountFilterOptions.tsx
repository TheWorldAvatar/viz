import { ColumnFilter, Table } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import { useFilterOptions } from "./useFilterOptions";

export interface FilterOptionsDescriptor {
  options: string[];
  isLoading: boolean;
  selectedAccount: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateAccount: (_newAccountName: string) => void;
}

/**
* A custom hook to retrieve the account specific filter options and additional states to query the filter options when required.
* 
* @param {string} accountType Type of account entity for rendering.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {Table<FieldValues>} table The table object containing data.
* @param {DateRange} selectedDate The currently selected date.
* @param {ColumnFilter[]} allFilters Filter state for the entire table.
*/
export function useAccountFilterOptions(
  accountType: string,
  lifecycleStage: LifecycleStage,
  table: Table<FieldValues>,
  selectedDate: DateRange,
  allFilters: ColumnFilter[],
): FilterOptionsDescriptor {
  const requireAccountFilter: boolean = lifecycleStage === LifecycleStageMap.PRICING;

  const router = useRouter();
  const pathName: string = usePathname();
  const searchParams: URLSearchParams = useSearchParams();

  const [selectedAccount, setSelectedAccount] = useState<string>(searchParams.get("account") ?? "");

  const { options, isLoading, setSearch, setTriggerFetch } = useFilterOptions(
    requireAccountFilter ? accountType : "",
    "name",
    lifecycleStage,
    selectedDate,
    selectedAccount ? [selectedAccount] : [],
    requireAccountFilter ? allFilters : [],
  );

  // A method to update the selected account on click in the selector
  const handleUpdateAccount = (newAccountId: string) => {
    // First set the column filters in the table on click
    const otherFilters: ColumnFilter[] = allFilters.filter(f => f.id !== accountType);
    table.setColumnFilters([
      ...otherFilters,
      // column filter is expected in the format {id: string, value: unknown}
      { id: accountType, value: [newAccountId] }
    ]);
    // Update the selected account state to propagate changes
    setSelectedAccount(newAccountId);
    // Update search params whenever selected account changes
    const params: URLSearchParams = new URLSearchParams(searchParams.toString());
    params.set("account", newAccountId);
    router.push(`${pathName}?${params.toString()}`);

  };

  // Always trigger an initial fetch
  useEffect(() => {
    setTriggerFetch(true);
  }, []);

  useEffect(() => {
    // When no query params is available, set the first option as default selected account by pushing to the route
    if (requireAccountFilter && selectedAccount.length === 0 && options?.length > 0) {
      router.push("?account=" + encodeURIComponent(options[0]));
      // Set selected account state to propagate changes before changing query params
      setSelectedAccount(options[0]);
    }
  }, [options, requireAccountFilter]);

  return {
    options,
    isLoading,
    selectedAccount,
    setSearch,
    handleUpdateAccount,
  };
}
