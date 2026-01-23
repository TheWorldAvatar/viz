"use client";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { useAccountFilterOptions } from "hooks/table/api/useAccountFilterOptions";
import { TableDescriptor } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React from "react";
import { DateRange } from "react-day-picker";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import Button from "ui/interaction/button";
import AsyncSearchableSimpleSelector from "ui/interaction/dropdown/async-searchable-simple-selector";
import DateInput from "ui/interaction/input/date-input";
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
  const isPermitted = usePermissionGuard();
  const { navigateToDrawer } = useDrawerNavigation();
  const isBillingStage: boolean = props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
    props.lifecycleStage === LifecycleStageMap.PRICING ||
    props.lifecycleStage === LifecycleStageMap.ACTIVITY;

  const { selectedAccount, handleUpdateAccount, getAccountFilterOptions } = useAccountFilterOptions(
    props.accountType,
    props.lifecycleStage,
    props.tableDescriptor.filters,
    props.tableDescriptor.setFilters,
  )

  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2 md:gap-0">
        {props.lifecycleStage !== LifecycleStageMap.GENERAL &&
          (
            <div className="bg-ring w-full sm:max-w-fit rounded-lg p-1 sm:p-1.5 border border-border">
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                {(!isBillingStage && isPermitted("pendingRegistry") && isPermitted("registry")) && (
                  <div className="sm:w-auto">
                    <RedirectButton
                      label={dict.nav.title.jobs}
                      leftIcon="local_shipping"
                      hasMobileIcon={false}
                      url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
                      variant={
                        props.lifecycleStage == LifecycleStageMap.PENDING ||
                          props.lifecycleStage == LifecycleStageMap.ACTIVE ||
                          props.lifecycleStage == LifecycleStageMap.ARCHIVE
                          ? "active"
                          : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                )}
                {(!isBillingStage && isPermitted("registry")) && (
                  <div className="sm:w-auto">
                    <RedirectButton
                      label={dict.nav.title.tasks}
                      leftIcon="list_alt"
                      hasMobileIcon={false}
                      url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                      variant={
                        props.lifecycleStage == LifecycleStageMap.OUTSTANDING ||
                          props.lifecycleStage == LifecycleStageMap.SCHEDULED ||
                          props.lifecycleStage == LifecycleStageMap.CLOSED
                          ? "active"
                          : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                )}
                {(isBillingStage) && (<>
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
                      leftIcon={"price_change"}
                      hasMobileIcon={false}
                      url={Routes.BILLING_PRICING_MODELS}
                      variant={
                        props.lifecycleStage === LifecycleStageMap.PRICING ? "active" : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 sm:w-auto">
                    <RedirectButton
                      label={dict.nav.title.activities}
                      leftIcon={"receipt_long"}
                      hasMobileIcon={false}
                      url={Routes.BILLING_ACTIVITY}
                      variant={
                        props.lifecycleStage === LifecycleStageMap.ACTIVITY ? "active" : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                </>
                )}
              </div>
            </div>
          )}
      </div>
      <div className="flex justify-between items-end md:gap-2 lg:gap-0 mt-4 flex-wrap">
        { /* Remove overflow-hidden when in billing stages to allow dropdown to overflow */}
        <div className={`flex flex-wrap sm:flex-nowrap items-stretch bg-ring rounded-lg border border-border divide-x divide-border ${isBillingStage ? '' : 'overflow-hidden '}`}>
          {props.lifecycleStage !== LifecycleStageMap.GENERAL &&
            (props.lifecycleStage === LifecycleStageMap.PENDING ||
              props.lifecycleStage === LifecycleStageMap.ACTIVE ||
              props.lifecycleStage === LifecycleStageMap.ARCHIVE) && (
              <>
                {isPermitted("pendingRegistry") && (
                  <RedirectButton
                    label={dict.nav.title.pending}
                    leftIcon="free_cancellation"
                    hasMobileIcon={false}
                    url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
                    variant={
                      props.lifecycleStage == LifecycleStageMap.PENDING ? "active" : "ghost"
                    }
                    className="text-sm font-medium !rounded-none !border-0"
                  />
                )}
                {isPermitted("pendingRegistry") && (
                  <RedirectButton
                    label={dict.nav.title.active}
                    leftIcon="check_circle_outline"
                    hasMobileIcon={false}
                    url={`${Routes.REGISTRY_GENERAL}/active/${props.entityType}`}
                    variant={
                      props.lifecycleStage == LifecycleStageMap.ACTIVE ? "active" : "ghost"
                    }
                    className="text-sm font-medium !rounded-none !border-0"
                  />
                )}
                {isPermitted("pendingRegistry") && (
                  <RedirectButton
                    label={dict.nav.title.archive}
                    leftIcon="archive_outlined"
                    hasMobileIcon={false}
                    url={`${Routes.REGISTRY_GENERAL}/archive/${props.entityType}`}
                    variant={
                      props.lifecycleStage == LifecycleStageMap.ARCHIVE ? "active" : "ghost"
                    }
                    className="text-sm font-medium !rounded-none !border-0"
                  />
                )}
              </>
            )}
          {props.lifecycleStage !== LifecycleStageMap.GENERAL &&
            (props.lifecycleStage === LifecycleStageMap.OUTSTANDING ||
              props.lifecycleStage === LifecycleStageMap.SCHEDULED ||
              props.lifecycleStage === LifecycleStageMap.CLOSED) && (
              <>
                <RedirectButton
                  label={dict.nav.title.outstanding}
                  leftIcon="pending"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                  variant={
                    props.lifecycleStage == LifecycleStageMap.OUTSTANDING ? "active" : "ghost"
                  }
                  className="text-sm font-medium !rounded-none !border-0 "
                />
                <RedirectButton
                  label={dict.nav.title.scheduled}
                  leftIcon="schedule"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
                  variant={
                    props.lifecycleStage == LifecycleStageMap.SCHEDULED ? "active" : "ghost"
                  }
                  className="text-sm font-medium !rounded-none !border-0 "
                />
                <RedirectButton
                  label={dict.nav.title.closed}
                  leftIcon="event_busy"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_CLOSED}`}
                  variant={
                    props.lifecycleStage == LifecycleStageMap.CLOSED ? "active" : "ghost"
                  }
                  className="text-sm font-medium !rounded-none !border-0 "
                />
              </>
            )}
          {props.lifecycleStage === LifecycleStageMap.ACTIVITY && selectedAccount != null && (
            <div className="flex justify-start">
              <div className="w-full md:w-[300px]">
                <AsyncSearchableSimpleSelector
                  options={getAccountFilterOptions}
                  initialValue={selectedAccount}
                  onChange={(value) => {
                    handleUpdateAccount(value);
                    props.tableDescriptor.table.resetRowSelection();
                    props.tableDescriptor.table.resetPageIndex();
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-end flex-wrap gap-2 mt-2 md:mt-0">
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
          {isPermitted("sales") &&
            (props.lifecycleStage == LifecycleStageMap.PENDING ||
              props.lifecycleStage == LifecycleStageMap.GENERAL ||
              props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
              props.lifecycleStage === LifecycleStageMap.PRICING) && (
              <Button
                leftIcon="add"
                size="icon"
                tooltipText={dict.action.addItem.replace(
                  "{replace}",
                  props.entityType.replace("_", " ")
                )}
                onClick={() => {
                  navigateToDrawer(Routes.REGISTRY_ADD,
                    ...(props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
                      props.lifecycleStage === LifecycleStageMap.PRICING ? [props.lifecycleStage] : []),
                    props.entityType
                  )
                }}
              />
            )}
          {props.instances.length > 0 && (
            <ColumnToggle
              columns={props.tableDescriptor.table.getAllLeafColumns()}
            />
          )}
          <Button
            leftIcon="filter_list_off"
            iconSize="medium"
            className="mt-1"
            disabled={props.tableDescriptor.filters.filter(
              filter => props.lifecycleStage !== LifecycleStageMap.ACTIVITY || filter?.id !== props.accountType
            ).every((filter) => (filter?.value as string[])?.length == 0)}
            size="icon"
            onClick={() => {
              if (props.lifecycleStage == LifecycleStageMap.ACTIVITY) {
                props.tableDescriptor.table.setColumnFilters([props.tableDescriptor.filters.find(filter => filter.id == props.accountType)]);
              } else {
                props.tableDescriptor.table.resetColumnFilters();
              }
              props.tableDescriptor.table.resetRowSelection();
            }}
            tooltipText={dict.action.clearAllFilters}
            variant="destructive"
          />
          {isPermitted("export") && <DownloadButton instances={props.instances} />}
          <Button
            size="icon"
            leftIcon="cached"
            variant="outline"
            onClick={triggerRefresh}
          />
        </div>
      </div>
    </div>
  );
}
