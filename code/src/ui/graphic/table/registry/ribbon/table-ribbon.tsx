"use client";

import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { TableDescriptor } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import React from "react";
import { DateRange } from "react-day-picker";
import { PermissionScheme } from "types/auth";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { DownloadButton } from "ui/interaction/action/download/download";
import RedirectButton from "ui/interaction/action/redirect/redirect-button";
import ReturnButton from "ui/interaction/action/redirect/return-button";
import Button from "ui/interaction/button";
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
 */
export default function TableRibbon(props: Readonly<TableRibbonProps>) {
  const dict: Dictionary = useDictionary();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-6">
      {props.lifecycleStage !== "general" &&
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.registry) && (
          <div className="bg-ring w-full sm:max-w-fit rounded-lg p-2 sm:p-1.5 border border-border ">
            <div className="flex flex-wrap items-center justify-between sm:gap-4 gap-1">
              {(!keycloakEnabled ||
                permissionScheme?.hasPermissions.pendingRegistry) && (
                  <div className="sm:w-auto">
                    <RedirectButton
                      label={"Jobs"}
                      leftIcon="table_chart"
                      hasMobileIcon={false}
                      url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
                      variant={
                        props.lifecycleStage == "pending" || props.lifecycleStage == "active" || props.lifecycleStage == "archive" ? "active" : "ghost"
                      }
                      className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                    />
                  </div>
                )}
              <div className="sm:w-auto">
                <RedirectButton
                  label={"Tasks"}
                  leftIcon="list_alt"
                  hasMobileIcon={false}
                  url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
                  variant={
                    props.lifecycleStage == "outstanding" || props.lifecycleStage == "scheduled" || props.lifecycleStage == "closed" ? "active" : "ghost"
                  }
                  className="w-full sm:w-auto py-3 sm:py-2 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      {props.lifecycleStage !== "general" && (props.lifecycleStage === "pending" || props.lifecycleStage === "active" || props.lifecycleStage === "archive") &&
        <div className="flex flex-wrap items-center sm:gap-3 gap-1">
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.pending}
              leftIcon="query_builder"
              iconSize="small"
              variant="outline"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_GENERAL}/${props.entityType}`}
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200  ${props.lifecycleStage === "pending" ? "shadow-sm !bg-amber-100 !border-amber-300 !text-amber-800 hover:!bg-amber-200 dark:!bg-amber-900/50 dark:!border-amber-700 dark:!text-amber-200 dark:hover:!bg-amber-800/50" : ""}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.active}
              leftIcon="bolt"
              iconSize="small"
              variant="outline"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_GENERAL}/active/${props.entityType}`}
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200  ${props.lifecycleStage === "active" ? "shadow-sm !bg-emerald-100 !border-emerald-300 !text-emerald-800 hover:!bg-emerald-200 dark:!bg-emerald-900/50 dark:!border-emerald-700 dark:!text-emerald-200 dark:hover:!bg-emerald-800/50" : ""}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.archive}
              leftIcon="inventory_2"
              iconSize="small"
              variant="outline"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_GENERAL}/archive/${props.entityType}`}
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200 ${props.lifecycleStage === "archive" ? "shadow-sm !bg-slate-100 !border-slate-300 !text-slate-800 hover:!bg-slate-200 dark:!bg-slate-800/50 dark:!border-slate-600 dark:!text-slate-200 dark:hover:!bg-slate-700/50" : ""}`}
            />
          </div>
        </div>
      }
      {props.lifecycleStage !== "general" && (props.lifecycleStage === "outstanding" || props.lifecycleStage === "scheduled" || props.lifecycleStage === "closed") &&
        <div className="flex flex-wrap items-center sm:gap-3 gap-1">
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.outstanding}
              iconSize="small"
              leftIcon="pending"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_TASK_OUTSTANDING}`}
              variant="outline"
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200  ${props.lifecycleStage === "outstanding" ? "shadow-sm !bg-amber-100 !border-amber-300 !text-amber-800 hover:!bg-amber-200 dark:!bg-amber-900/50 dark:!border-amber-700 dark:!text-amber-200 dark:hover:!bg-amber-800/50" : ""}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.scheduled}
              leftIcon="schedule"
              iconSize="small"
              variant="outline"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_TASK_SCHEDULED}`}
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200  ${props.lifecycleStage === "scheduled" ? "shadow-sm !bg-emerald-100 !border-emerald-300 !text-emerald-800 hover:!bg-emerald-200 dark:!bg-emerald-900/50 dark:!border-emerald-700 dark:!text-emerald-200 dark:hover:!bg-emerald-800/50" : ""}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <RedirectButton
              label={dict.nav.title.closed}
              leftIcon="event_busy"
              iconSize="small"
              variant="outline"
              hasMobileIcon={false}
              url={`${Routes.REGISTRY_TASK_CLOSED}`}
              className={`w-full sm:w-auto !py-2 px-6 text-sm font-medium !rounded-full border transition-colors duration-200 ${props.lifecycleStage === "closed" ? "shadow-sm !bg-slate-100 !border-slate-300 !text-slate-800 hover:!bg-slate-200 dark:!bg-slate-800/50 dark:!border-slate-600 dark:!text-slate-200 dark:hover:!bg-slate-700/50" : ""}`}
            />
          </div>
        </div>
      }
      {/* <div className="w-full  h-[0.5px] bg-border" /> */}
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
            props.lifecycleStage == "closed") && (
              <DateInput
                selectedDate={props.selectedDate}
                setSelectedDateRange={props.setSelectedDate}
                disabledDates={getDisabledDates(props.lifecycleStage)}
              />
            )}
        </div>
        <div className="flex items-end flex-wrap gap-2 mt-2 md:mt-0  ">
          {props.tableDescriptor.table
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
                  props.tableDescriptor.table.resetColumnFilters()
                  props.tableDescriptor.table.resetRowSelection()
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
              props.lifecycleStage == "general") && (
              <RedirectButton
                leftIcon="add"
                size="icon"
                tooltipText={dict.action.addItem.replace(
                  "{replace}",
                  props.entityType.replace("_", " ")
                )}
                url={`${Routes.REGISTRY_ADD}/${props.entityType}`}
              />
            )}
          {props.lifecycleStage == "report" && (
            <ReturnButton
              leftIcon="first_page"
              label={dict.action.backTo.replace(
                "{replace}",
                props.entityType.replace("_", " ")
              )}
            />
          )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.invoice) &&
            props.lifecycleStage == "report" && (
              <RedirectButton
                leftIcon="print"
                label={dict.action.generateReport}
                url={`${Routes.REGISTRY_EDIT}/pricing/${props.path}`}
              />
            )}
          {(!keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions.export) && (
              <DownloadButton instances={props.instances} />
            )}
        </div>
      </div>
    </div>
  );
}
