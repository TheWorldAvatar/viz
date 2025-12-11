"use client";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { useAccountFilterOptions } from "hooks/table/api/useAccountFilterOptions";
import { TableDescriptor } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React from "react";
import { DateRange } from "react-day-picker";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import Button from "ui/interaction/button";
import SearchableSimpleSelector from "ui/interaction/dropdown/searchable-simple-selector";
import DateInput from "ui/interaction/input/date-input";
import { buildUrl } from "utils/client-utils";
import ColumnToggle from "../../action/column-toggle";
import { getDisabledDates } from "../registry-table-utils";

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
  const isBillingStage: boolean = props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
    props.lifecycleStage === LifecycleStageMap.PRICING ||
    props.lifecycleStage === LifecycleStageMap.ACTIVITY;

  const { options, isLoading, selectedAccount, setSearch, handleUpdateAccount } = useAccountFilterOptions(
    props.accountType,
    props.lifecycleStage,
    props.tableDescriptor.table,
    props.selectedDate,
    props.tableDescriptor.filters,
  )

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      {props.lifecycleStage !== LifecycleStageMap.GENERAL && !isBillingStage &&
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
                    props.lifecycleStage === LifecycleStageMap.ACCOUNT ? "active" : "ghost"
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
                    props.lifecycleStage === LifecycleStageMap.PRICING ? "active" : "ghost"
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
                    props.lifecycleStage === LifecycleStageMap.ACTIVITY ? "active" : "ghost"
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
          {(props.lifecycleStage == LifecycleStageMap.SCHEDULED ||
            props.lifecycleStage == LifecycleStageMap.CLOSED ||
            props.lifecycleStage == LifecycleStageMap.ACTIVITY) && (
              <DateInput
                mode="range"
                selectedDate={props.selectedDate}
                setSelectedDateRange={props.setSelectedDate}
                disabledDates={getDisabledDates(props.lifecycleStage)}
              />
            )}
        </div>
        <div className="flex items-end flex-wrap gap-2 mt-2 md:mt-0">
          {props.lifecycleStage !== LifecycleStageMap.PRICING && props.tableDescriptor.table
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
            (props.lifecycleStage == LifecycleStageMap.PENDING ||
              props.lifecycleStage == LifecycleStageMap.GENERAL ||
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
      {props.lifecycleStage === LifecycleStageMap.PRICING && selectedAccount.length > 0 && (
        <div className="flex justify-start">
          <div className="md:w-[300px]">
            <SearchableSimpleSelector
              options={options}
              initialValue={selectedAccount}
              onChange={(value) => {
                handleUpdateAccount(value);
                props.tableDescriptor.table.resetRowSelection();
                props.tableDescriptor.table.resetPageIndex();
              }}
              onSearchChange={(searchValue) => {
                setSearch(searchValue);
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
