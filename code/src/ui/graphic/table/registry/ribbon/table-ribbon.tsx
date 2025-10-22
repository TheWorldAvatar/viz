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
import useOperationStatus from "hooks/useOperationStatus";
import { JsonObject } from "types/json";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import { AgentResponseBody } from "types/backend-agent";
import { toast } from "ui/interaction/action/toast/toast";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";

interface TableRibbonProps {
  path: string;
  entityType: string;
  selectedDate: DateRange;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setSelectedDate: React.Dispatch<React.SetStateAction<DateRange>>;
  triggerRefresh: () => void;
  tableDescriptor: TableDescriptor;
  onBulkApproval?: React.MouseEventHandler<HTMLButtonElement>;
  onBulkResubmitForApproval?: React.MouseEventHandler<HTMLButtonElement>;
  selectedRowsCount?: number;
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
  const { isLoading, startLoading, stopLoading } = useOperationStatus();
  const [isActionMenuOpen, setIsActionMenuOpen] =
    React.useState<boolean>(false);
  const triggerRefresh: React.MouseEventHandler<HTMLButtonElement> = () => {
    props.triggerRefresh();
  };

  const handleBulkApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const selectedRows = props.tableDescriptor.table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map(row => {
      return row.original.id
    });

    const reqBody: JsonObject = {
      contract: contractIds,
      remarks: `${contractIds.length} contract(s) approved successfully!`,
    };
    startLoading();
    const res = await fetch(
      makeInternalRegistryAPIwithParams("event", "service", "commence"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ ...reqBody }),
      }
    );

    const responseBody: AgentResponseBody = await res.json();
    stopLoading();
    toast(
      responseBody?.data?.message || responseBody?.error?.message,
      responseBody?.error ? "error" : "success"
    );

    if (!responseBody?.error) {
      // Clear selection and refresh table
      props.tableDescriptor.table.resetRowSelection();
      props.triggerRefresh();
    }
  };

  const handleBulkResubmitForApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const selectedRows = props.tableDescriptor.table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map(row => {
      return row.original.id
    });

    const reqBody: JsonObject = {
      contract: contractIds,
    };
    startLoading();
    const res = await fetch(
      makeInternalRegistryAPIwithParams("event", "draft", "reset"),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ ...reqBody }),
      }
    );

    const responseBody: AgentResponseBody = await res.json();
    stopLoading();
    toast(
      responseBody?.data?.message || responseBody?.error?.message,
      responseBody?.error ? "error" : "success"
    );

    if (!responseBody?.error) {
      // Clear selection and refresh table
      props.tableDescriptor.table.resetRowSelection();
      props.triggerRefresh();
    }
  };

  return (
    <div className="flex flex-col p-1 md:p-2 gap-2 md:gap-4">
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
          {props.lifecycleStage === "pending" &&
            props.tableDescriptor.table.getSelectedRowModel().rows.length > 0 &&
            <PopoverActionButton
              placement="bottom-start"
              leftIcon="more_vert"
              variant="outline"
              tooltipText={dict.title.actions}
              className="border-dashed"
              label={`Selected (${props.tableDescriptor.table.getSelectedRowModel().rows.length})`}
              isOpen={isActionMenuOpen}
              setIsOpen={setIsActionMenuOpen}
            >
              <div className="flex flex-col space-y-8 lg:space-y-4">
                <Button
                  leftIcon="done_outline"
                  label={dict.action.approve}
                  onClick={handleBulkApproval}
                  variant="outline"
                  disabled={isLoading}
                  className="border-dashed"
                />
                <Button
                  leftIcon="published_with_changes"
                  label={dict.action.resubmit}
                  onClick={handleBulkResubmitForApproval}
                  variant="outline"
                  disabled={isLoading}
                  className="border-dashed"
                />
              </div>

            </PopoverActionButton>
          }

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
                onClick={() => props.tableDescriptor.table.resetColumnFilters()}
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
