import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";
import { TableDescriptor } from "hooks/table/useTable";
import { DragAndDropDescriptor, useTableDnd } from "hooks/table/useTableDnd";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { PermissionScheme } from "types/auth";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStage, LifecycleStageMap } from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import Checkbox from "ui/interaction/input/checkbox";
import { buildUrl, getId } from "utils/client-utils";
import { EVENT_KEY } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction from "../action/registry-row-action";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import TableRow from "../row/table-row";


interface RegistryTableProps {
  recordType: string;
  accountType: string;
  lifecycleStage: LifecycleStage;
  selectedDate: DateRange;
  tableDescriptor: TableDescriptor;
  triggerRefresh: () => void;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);

  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor.table,
    props.tableDescriptor.data,
    props.tableDescriptor.setData
  );

  const { isLoading, startLoading, stopLoading } = useOperationStatus();
  const numberOfSelectedRows: number = props.tableDescriptor.table.getSelectedRowModel().rows.length;
  const hasAmendedStatus: boolean = props.tableDescriptor.table.getSelectedRowModel().rows.some(
    (row) => (row.original.status as string)?.toLowerCase() === "amended"
  );
  const allowMultipleSelection: boolean = props.lifecycleStage !== LifecycleStageMap.GENERAL;

  const onRowClick = async (row: FieldValues) => {
    if (isLoading) return;
    const recordId: string = row.event_id
      ? getId(row.event_id)
      : row.id
        ? getId(row.id)
        : getId(row.iri);
    if (
      props.lifecycleStage === LifecycleStageMap.TASKS ||
      props.lifecycleStage === LifecycleStageMap.OUTSTANDING ||
      props.lifecycleStage === LifecycleStageMap.SCHEDULED ||
      props.lifecycleStage === LifecycleStageMap.CLOSED
    ) {

      // Determine the appropriate task route based on status and permissions
      let taskRoute: string;
      if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.operation) &&
        ((row.status as string).toLowerCase() === "new" ||
          ((row.status as string).toLowerCase() === "assigned" &&
            props.lifecycleStage === LifecycleStageMap.SCHEDULED))
      ) {
        taskRoute = Routes.REGISTRY_TASK_DISPATCH;
      } else if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.completeTask) &&
        (row.status as string).toLowerCase() === "assigned"
      ) {
        taskRoute = Routes.REGISTRY_TASK_COMPLETE;
      } else {
        taskRoute = Routes.REGISTRY_TASK_VIEW;
      }
      router.push(buildUrl(taskRoute, recordId));
    } else if (props.lifecycleStage === LifecycleStageMap.ACTIVITY) {
      browserStorageManager.set(EVENT_KEY, row.event_id)
      const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, row.id);
      const body: AgentResponseBody = await queryInternalApi(url);
      if (body.data.message == "true") {
        router.push(buildUrl(Routes.BILLING_ACTIVITY_TRANSACTION, getId(row.event_id)))
      } else {
        router.push(buildUrl(Routes.BILLING_ACTIVITY_PRICE, getId(row.id)));
      }
    } else {
      const registryRoute: string =
        !keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.operation ||
          permissionScheme.hasPermissions.sales
          ? Routes.REGISTRY_EDIT
          : Routes.REGISTRY;
      router.push(buildUrl(registryRoute, props.recordType, recordId));
    }
  };

  const handleBulkAction = async (action: "approve" | "resubmit") => {
    const selectedRows = props.tableDescriptor.table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map((row) => row.original.id);

    let reqBody: JsonObject;
    let apiUrl: string;
    let method: Omit<HTTP_METHOD, "HEAD" | "OPTIONS" | "PATCH">;

    switch (action) {
      case "approve":
        reqBody = {
          contract: contractIds,
          remarks: `${contractIds.length} contract(s) approved successfully!`,
        };
        apiUrl = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "service", "commence");
        method = "POST";
        break;
      case "resubmit":
        reqBody = {
          contract: contractIds,
        };
        apiUrl = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.EVENT, "draft", "reset");
        method = "PUT";
        break;
      default:
        throw new Error("Invalid action");
    }
    startLoading();
    const responseBody: AgentResponseBody = await queryInternalApi(apiUrl, method, JSON.stringify(reqBody));
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
    <>
      {props.tableDescriptor.table.getVisibleLeafColumns().length > 0 ? (
        <>
          <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden">
            {/* Table container */}
            <div className="overflow-auto flex-1 min-h-[500px] table-scrollbar ">
              <div className="min-w-full ">
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={dragAndDropDescriptor.handleDragEnd}
                  sensors={dragAndDropDescriptor.sensors}
                >
                  <table
                    aria-label={`${props.recordType} registry table`}
                    className="w-full border-separate border-spacing-0"
                  >
                    <thead className="bg-muted sticky top-0 z-10">
                      {props.tableDescriptor.table
                        .getHeaderGroups()
                        .map((headerGroup) => (
                          <TableRow
                            key={headerGroup.id}
                            id={headerGroup.id}
                            isHeader={true}
                          >
                            <TableCell className="w-[calc(100%/20)] sticky left-0 z-20 bg-muted">
                              <div className="flex justify-end items-center rounded-md gap-2 mt-10">
                                {numberOfSelectedRows > 0 && (
                                  <PopoverActionButton
                                    placement="bottom-start"
                                    leftIcon={isActionMenuOpen ? "arrow_drop_up" : "arrow_drop_down"}
                                    variant="ghost"
                                    size="icon"
                                    tooltipText={dict.title.actions}
                                    isOpen={isActionMenuOpen}
                                    setIsOpen={setIsActionMenuOpen}
                                  >
                                    <div className="flex flex-col space-y-3">
                                      {props.lifecycleStage === "pending" && (
                                        <>
                                          <Button
                                            leftIcon="done_outline"
                                            label={dict.action.approve}
                                            variant="ghost"
                                            disabled={isLoading}
                                            onClick={() => handleBulkAction("approve")}
                                          />
                                          {hasAmendedStatus && (
                                            <Button
                                              leftIcon="published_with_changes"
                                              label={dict.action.resubmit}
                                              variant="ghost"
                                              disabled={isLoading}
                                              onClick={() => handleBulkAction("resubmit")}
                                            />
                                          )}
                                        </>
                                      )}
                                      {(!keycloakEnabled ||
                                        !permissionScheme ||
                                        permissionScheme.hasPermissions
                                          .draftTemplate) && (
                                          <DraftTemplateButton
                                            rowId={props.tableDescriptor.table.getSelectedRowModel().rows.map((row) => row.original.id)}
                                            recordType={props.recordType}
                                            triggerRefresh={props.triggerRefresh}
                                            resetRowSelection={props.tableDescriptor.table.resetRowSelection}
                                          />
                                        )}
                                    </div>
                                  </PopoverActionButton>
                                )}
                                {allowMultipleSelection && (
                                  <Checkbox
                                    aria-label={dict.action.selectAll}
                                    disabled={isLoading}
                                    checked={props.tableDescriptor.table.getIsAllPageRowsSelected()}
                                    handleChange={(checked) => {
                                      props.tableDescriptor.table.getRowModel().rows.forEach((row) => {
                                        row.toggleSelected(checked);
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            </TableCell>
                            {headerGroup.headers.map((header, index) => {
                              return (
                                <HeaderCell
                                  key={header.id + index}
                                  type={props.recordType}
                                  table={props.tableDescriptor.table}
                                  header={header}
                                  lifecycleStage={props.lifecycleStage}
                                  selectedDate={props.selectedDate}
                                  filters={props.tableDescriptor.filters}
                                  disableFilter={header.id == props.accountType}
                                />
                              );
                            })}
                          </TableRow>
                        ))}
                    </thead>

                    <tbody>
                      {props.tableDescriptor.table.getRowModel().rows?.length > 0 && (
                        <SortableContext
                          items={dragAndDropDescriptor.dataIds}
                          strategy={verticalListSortingStrategy}
                        >
                          {props.tableDescriptor.table.getRowModel().rows.map((row, index) => (
                            <TableRow
                              key={row.id + index}
                              id={row.id}
                              isHeader={false}
                            >
                              <TableCell className="sticky left-0 z-20 bg-background group-hover:bg-muted cursor-default">
                                <div className="flex gap-0.5">
                                  <DragActionHandle disabled={isLoading} id={row.id} />
                                  <RegistryRowAction
                                    recordType={props.recordType}
                                    lifecycleStage={props.lifecycleStage}
                                    row={row.original}
                                    triggerRefresh={props.triggerRefresh}
                                  />
                                  {allowMultipleSelection && (
                                    <Checkbox
                                      aria-label={row.id}
                                      className="ml-2"
                                      disabled={isLoading}
                                      checked={row.getIsSelected()}
                                      handleChange={(checked) =>
                                        row.toggleSelected(checked)
                                      }
                                    />
                                  )}
                                </div>
                              </TableCell>
                              {row.getVisibleCells().map((cell, index) => (
                                <TableCell
                                  key={cell.id + index}
                                  width={cell.column.getSize()}
                                  onClick={() =>
                                    onRowClick(row.original as FieldValues)
                                  }
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </SortableContext>
                      )}
                    </tbody>
                  </table>
                </DndContext>
              </div>
            </div>
          </div>
          <TablePagination rows={props.tableDescriptor.totalRows} table={props.tableDescriptor.table} pagination={props.tableDescriptor.pagination} />
        </>
      ) : (
        <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
          {dict.message.noVisibleColumns}
        </div>
      )}
    </>
  );
}
