"use client";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { TableDescriptor } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import Button from "ui/interaction/button";
import DateInput from "ui/interaction/input/date-input";
import ColumnToggle from "../../action/column-toggle";
import { getDisabledDates } from "../registry-table-utils";
import { buildUrl } from "utils/client-utils";
import SearchableSimpleSelector from "ui/interaction/dropdown/searchable-simple-selector";
import { useFilterOptions } from "hooks/table/api/useFilterOptions";
import { ColumnFiltersState } from "@tanstack/react-table";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: DateRange;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<DateRange>>;
  triggerRefresh: () => void;
  tableDescriptor: TableDescriptor;
  accountType?: string;
}

/**
 * Renders a ribbon for the view page
 *
 * @param {string} path The current path name after the last /.
 * @param {string} entityType The type of entity.
 * @param {DateRange} selectedDate The selected date range object with 'from' and 'to' date strings.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The target instances to export into csv.
 * @param setSelectedDate A dispatch method to update selected date range.
 * @param triggerRefresh Method to trigger refresh.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param {UISettings} uiSettings The UI settings from configuration.
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };
  const isBillingStage: boolean = props.lifecycleStage === "account" ||
    props.lifecycleStage === "pricing" ||
    props.lifecycleStage === "activity";

  const shouldUseAccountFilter: boolean = props.lifecycleStage === "pricing";
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const {
    options: accountOptions,
    isLoading: isLoadingAccounts,
    setSearch,
    setTriggerFetch,
  } = useFilterOptions(
    shouldUseAccountFilter ? props.accountType : "",
    "name",
    props.lifecycleStage,
    props.selectedDate,
    selectedAccount ? [selectedAccount] : [],
    shouldUseAccountFilter ? props.tableDescriptor.filters : [],
  );

  // Initialize filter: trigger fetch and auto-select first option
  useEffect(() => {
    if (shouldUseAccountFilter) {
      setTriggerFetch(true);
      if (!selectedAccount && accountOptions && accountOptions.length > 0) {
        setSelectedAccount(accountOptions[0]);
      }
    }
  }, [accountOptions, shouldUseAccountFilter, setTriggerFetch, selectedAccount]);

  useEffect(() => {
    if (shouldUseAccountFilter && props.tableDescriptor?.table) {
      try {
        const tableState = props.tableDescriptor.table.getState();
        // Ensure table state is initialized
        if (!tableState || !tableState.columnFilters) return;

        const currentFilters: ColumnFiltersState = Array.isArray(tableState.columnFilters) ? tableState.columnFilters : [];
        // Filter by "client" field which links pricing models to accounts
        const otherFilters: ColumnFiltersState = currentFilters.filter(f => f.id !== props.accountType);

        if (selectedAccount) {
          props.tableDescriptor.table.setColumnFilters([
            ...otherFilters,
            // column filter is expected in the format {id: string, value: unknown}
            { id: props.accountType, value: [selectedAccount] }
          ]);
        } else if (otherFilters.length !== currentFilters.length) {
          props.tableDescriptor.table.setColumnFilters(otherFilters);
        }
      } catch (error) {
        console.error("Error setting column filters:", error);
      }
    }
  }, [selectedAccount, shouldUseAccountFilter]);

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== "general" && !isBillingStage &&
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.registry) && (
          <div className="bg-ring w-full sm:max-w-fit rounded-lg p-2 sm:p-1.5 border border-border ">
            <div className="flex flex-wrap items-center justify-between sm:gap-4 gap-1">
              {(!keycloakEnabled ||
                permissionScheme?.hasPermissions.pendingRegistry) && (
                  <div className="sm:w-auto">
                    <RedirectButton
                      label={dict.nav.title.pending}
                      leftIcon="free_cancellation"
                      hasMobileIcon={false}
                      url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
                      variant={
                        props.lifecycleStage == "pending" ? "active" : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                )}
              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.outstanding}
                  leftIcon="pending"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                  variant={
                    props.lifecycleStage == "outstanding" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.scheduled}
                  leftIcon="schedule"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
                  variant={
                    props.lifecycleStage == "scheduled" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
              <div className="w-full sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.closed}
                  leftIcon="event_busy"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_CLOSED}`}
                  variant={
                    props.lifecycleStage == "closed" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      {isBillingStage &&
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.registry) && (
          <div className="bg-ring w-full sm:max-w-fit rounded-lg p-2 sm:p-1.5 border border-border ">
            <div className="flex flex-wrap items-center justify-between sm:gap-4 gap-1">
              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.accounts}
                  leftIcon={"account_balance_wallet"}
                  hasMobileIcon={false}
                  url={Routes.BILLING_ACCOUNTS}
                  variant={
                    props.lifecycleStage === "account" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.pricing}
                  leftIcon={"account_balance_wallet"}
                  hasMobileIcon={false}
                  url={Routes.BILLING_PRICING_MODELS}
                  variant={
                    props.lifecycleStage === "pricing" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
              <div className="sm:w-auto">
                <RedirectButton
                  label={dict.nav.title.activities}
                  leftIcon={"account_balance_wallet"}
                  hasMobileIcon={false}
                  url={Routes.BILLING_ACTIVITY}
                  variant={
                    props.lifecycleStage === "activity" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      <div className="w-full  h-[1px] bg-border " />
      <div className="flex justify-between items-end md:gap-2 lg:gap-0 flex-wrap ">
        <div className="flex items-end !-ml-2 gap-3 md:gap-4">
          <Button
            className="ml-2"
            size="icon"
            leftIcon="cached"
            variant="outline"
            onClick={triggerRefresh}
          />
          {(props.lifecycleStage == "scheduled" ||
            props.lifecycleStage == "closed" ||
            props.lifecycleStage == "activity") && (
              <DateInput
                selectedDate={props.selectedDate}
                setSelectedDateRange={props.setSelectedDate}
                disabledDates={getDisabledDates(props.lifecycleStage)}
              />
            )}
        </div>
        <div className="flex items-end flex-wrap gap-2 mt-2 md:mt-0">
          {props.lifecycleStage !== "pricing" && props.tableDescriptor.table
            .getState()
            .columnFilters?.some(
              (filter) => (filter?.value as string[])?.length > 0
            ) && (
              <Button
                leftIcon="filter_list_off"
                iconSize="medium"
                className="mt-1"
                size="icon"
                onClick={() => {
                  props.tableDescriptor.table.resetColumnFilters();
                  props.tableDescriptor.table.resetRowSelection();
                }}
                tooltipText={dict.action.clearAllFilters}
                variant="destructive"
              />
            )}
          {props.instances.length > 0 && (
            <ColumnToggle
              columns={props.tableDescriptor.table.getAllLeafColumns()}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.sales) &&
            (props.lifecycleStage == "pending" ||
              props.lifecycleStage == "general" ||
              isBillingStage) && (
              <RedirectButton
                leftIcon="add"
                size="icon"
                tooltipText={dict.action.addItem.replace(
                  "{replace}",
                  props.entityType.replace("_", " ")
                )}
                url={
                  buildUrl(Routes.REGISTRY_ADD,
                    ...(props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
                      props.lifecycleStage === LifecycleStageMap.PRICING ? [props.lifecycleStage] : []),
                    props.entityType
                  )
                }
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.export) && (
              <DownloadButton instances={props.instances} />
            )}
        </div>
      </div>
      {props.lifecycleStage === "pricing" && (
        <div className="flex justify-start">
          <div className="md:w-[300px]">
            <SearchableSimpleSelector
              options={accountOptions}
              value={selectedAccount}
              onChange={(value) => {
                setSelectedAccount(value);
                props.tableDescriptor.table.resetRowSelection();
                props.tableDescriptor.table.resetPageIndex();
              }}
              onSearchChange={(searchValue) => {
                setSearch(searchValue);
                setTriggerFetch(true);
              }}
              isLoading={isLoadingAccounts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
