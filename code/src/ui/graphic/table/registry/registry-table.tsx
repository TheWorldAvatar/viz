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
import { useDrawerNavigation } from "hooks/drawer/useDrawerNavigation";
import { TableDescriptor } from "hooks/table/useTable";
import { DragAndDropDescriptor, useTableDnd } from "hooks/table/useTableDnd";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { Routes } from "io/config/routes";
import { HTTP_METHOD } from "next/dist/server/web/http";

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStage, LifecycleStageMap, RegistryStatusMap } from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import Checkbox from "ui/interaction/input/checkbox";
import HistoryModal from "ui/interaction/modal/history-modal";
import { getAfterDelimiter, getId } from "utils/client-utils";
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
  disableRowAction: boolean;
  lifecycleStage: LifecycleStage;
  tableDescriptor: TableDescriptor;
  triggerRefresh: () => void;
  selectedDate?: DateRange;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {boolean} disableRowAction Hides the row actions for the user if true.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const { navigateToDrawer } = useDrawerNavigation();
  const isPermitted = usePermissionGuard();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState<boolean>(false);
  const [historyId, setHistoryId] = useState<string>("");

  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor.table,
    props.tableDescriptor.data,
    props.tableDescriptor.setData
  );

  const { isLoading, startLoading, stopLoading, resetFormSession } = useOperationStatus();
  const numberOfSelectedRows: number = props.tableDescriptor.table.getSelectedRowModel().rows.length;
  const hasAmendedStatus: boolean = props.tableDescriptor.table.getSelectedRowModel().rows.some(
    (row) => (row.original.status as string)?.toLowerCase() === "amended"
  );
  const allowMultipleSelection: boolean = props.lifecycleStage === LifecycleStageMap.PENDING || props.lifecycleStage === LifecycleStageMap.ACTIVE
    || props.lifecycleStage === LifecycleStageMap.ARCHIVE || props.lifecycleStage === LifecycleStageMap.OUTSTANDING || props.lifecycleStage === LifecycleStageMap.SCHEDULED
    || props.lifecycleStage === LifecycleStageMap.CLOSED || props.lifecycleStage === LifecycleStageMap.BILLABLE;

  const onRowClick = async (row: FieldValues) => {
    if (isLoading) return;
    const recordId: string = row.event_id
      ? getId(row.event_id)
      : row.id
        ? getId(row.id)
        : getId(row.iri);
    // Clear any stored form data when clicking on a row
    browserStorageManager.clear();
    resetFormSession();
    if (
      props.lifecycleStage === LifecycleStageMap.TASKS ||
      props.lifecycleStage === LifecycleStageMap.OUTSTANDING ||
      props.lifecycleStage === LifecycleStageMap.SCHEDULED
    ) {

      // Determine the appropriate task route based on status and permissions
      let taskRoute: string;
      if (isPermitted("operation") &&
        ((row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.NEW ||
          ((row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.ASSIGNED &&
            props.lifecycleStage === LifecycleStageMap.SCHEDULED))
      ) {
        taskRoute = Routes.REGISTRY_TASK_DISPATCH;
      } else if (isPermitted("completeTask") &&
        (row[dict.title.status] as string).toLowerCase() === RegistryStatusMap.ASSIGNED
      ) {
        taskRoute = Routes.REGISTRY_TASK_COMPLETE;
      } else {
        taskRoute = Routes.REGISTRY_TASK_VIEW;
      }
      navigateToDrawer(taskRoute, recordId);
    } else if (props.lifecycleStage === LifecycleStageMap.CLOSED) {
      if (isPermitted("invoice") &&
        [RegistryStatusMap.COMPLETED, RegistryStatusMap.CANCELLED,
        RegistryStatusMap.REPORTED, RegistryStatusMap.BILLABLE_CANCELLED,
        RegistryStatusMap.BILLABLE_COMPLETED, RegistryStatusMap.BILLABLE_REPORTED].includes(row[dict.title.status].toLowerCase())
      ) {
        browserStorageManager.set(EVENT_KEY, row.event_id)
        const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, row.id);
        const body: AgentResponseBody = await queryInternalApi(url);
        try {
          const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.FILTER,
            LifecycleStageMap.ACCOUNT,
            props.accountType,
            row[props.accountType]
          ));
          const options: SelectOptionType[] = res.data?.items as SelectOptionType[];
          // Set the account type in browser storage to match the values of the account type in the assign price form
          browserStorageManager.set(props.accountType, options[0]?.value);
        } catch (error) {
          console.error("Error fetching instances", error);
        }
        if (body.data.message == "true") {
          navigateToDrawer(Routes.REGISTRY_TASK_ACCRUAL, recordId);
        } else {
          navigateToDrawer(Routes.BILLING_ACTIVITY_PRICE, getId(row.id));
        }
      } else {
        navigateToDrawer(Routes.REGISTRY_TASK_VIEW, recordId);
      }
    } else if (props.lifecycleStage === LifecycleStageMap.INVOICE) {
      navigateToDrawer(Routes.REGISTRY, props.recordType, recordId);
    } else {
      const registryRoute: string = isPermitted("edit") ? Routes.REGISTRY_EDIT : Routes.REGISTRY;
      navigateToDrawer(registryRoute, props.recordType, recordId);
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
          <div className="flex rounded-lg border border-border w-[75dvw] max-h-screen overflow-auto fade-in-on-motion table-scrollbar">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={dragAndDropDescriptor.handleDragEnd}
              sensors={dragAndDropDescriptor.sensors}
            >
              <table
                aria-label={`${props.recordType} registry table`}
                className="border-separate border-spacing-0 w-full"
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
                        <TableCell className="w-1/10 sticky left-0 z-20 bg-muted">
                          <div className="flex justify-end items-center rounded-md gap-2">
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
                                  {isPermitted("draftTemplate") && (
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
                                className="w-4 h-4 cursor-pointer"
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
                              disableFilter={props.lifecycleStage == LifecycleStageMap.BILLABLE && header.id == props.accountType}
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
                            <div className="flex items-center justify-end gap-0.5">
                              {!props.disableRowAction &&
                                <>
                                  <DragActionHandle disabled={isLoading} id={row.id} />
                                  <RegistryRowAction
                                    recordType={props.recordType}
                                    accountType={props.accountType}
                                    lifecycleStage={props.lifecycleStage}
                                    row={row.original}
                                    triggerRefresh={props.triggerRefresh}
                                  />
                                  <Button
                                    leftIcon="history"
                                    size="icon"
                                    variant="ghost"
                                    tooltipText={dict.title.history}
                                    onClick={() => {
                                      if (props.lifecycleStage == LifecycleStageMap.OUTSTANDING ||
                                        props.lifecycleStage == LifecycleStageMap.SCHEDULED ||
                                        props.lifecycleStage == LifecycleStageMap.CLOSED) {
                                        setHistoryId(getAfterDelimiter(row.original.event_id as string, "/"));
                                      } else {
                                        setHistoryId(row.original.id as string);
                                      }
                                      setIsOpenHistoryModal(true);
                                    }}
                                  />
                                </>
                              } {allowMultipleSelection && (
                                <Checkbox
                                  aria-label={row.id}
                                  className={`${!props.disableRowAction && "ml-2"} w-4 h-4 cursor-pointer`}
                                  disabled={isLoading}
                                  checked={row.getIsSelected()}
                                  handleChange={(checked) => {
                                    if (props.lifecycleStage == LifecycleStageMap.BILLABLE) {
                                      props.tableDescriptor.setSelectedRows(
                                        getId(row.getValue("event_id")), !checked);
                                    }
                                    row.toggleSelected(checked);
                                  }}
                                />
                              )}
                            </div>
                          </TableCell>
                          {row.getVisibleCells().map((cell, index) => (
                            <TableCell
                              key={cell.id + index}
                              width={cell.column.getSize()}
                              onClick={() => {
                                if (props.lifecycleStage == LifecycleStageMap.BILLABLE) {
                                  const isSelected: boolean = row.getIsSelected();
                                  props.tableDescriptor.setSelectedRows(
                                    getId(row.getValue("event_id")), isSelected);
                                  row.toggleSelected(!isSelected);
                                } else {
                                  onRowClick(row.original as FieldValues);
                                }
                              }}
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
          <TablePagination rows={props.tableDescriptor.totalRows} table={props.tableDescriptor.table} pagination={props.tableDescriptor.pagination} />
        </>
      ) : (
        <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
          {dict.message.noVisibleColumns}
        </div>
      )}
      {isOpenHistoryModal && historyId != "" && <HistoryModal
        id={historyId}
        entityType={props.recordType}
        lifecycleStage={props.lifecycleStage}
        isOpen={isOpenHistoryModal}
        setIsOpen={setIsOpenHistoryModal}
      />}
    </>
  );
}
