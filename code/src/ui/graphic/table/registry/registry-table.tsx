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

import { usePermissionGuard } from "hooks/auth/usePermissionGuard";
import useTableSession from "hooks/table/useTableSession";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStage, LifecycleStageMap, RegistryStatusMap } from "types/form";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import { getId } from "utils/client-utils";
import { DATE_KEY, EVENT_KEY } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
import { TableSessionContextProvider } from "utils/table/TableSessionContext";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import HeaderRow from "../row/header-row";
import TableRow from "../row/table-row";
import { EnhancedColumnDef } from "./registry-table-utils";

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

  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor.table,
    props.tableDescriptor.data,
    props.tableDescriptor.setData
  );

  const { isLoading, resetFormSession } = useOperationStatus();
  const { setActiveRowId } = useTableSession();

  const getRowRecordId = (row: FieldValues): string => {
    if (row.event_id) {
      return getId(row.event_id);
    }

    if (row.id) {
      return getId(row.id);
    }

    return getId(row.iri);
  };

  const onRowClick = async (row: FieldValues) => {
    if (isLoading) return;
    const recordId: string = getRowRecordId(row);
    setActiveRowId(recordId);
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
        browserStorageManager.set(DATE_KEY, row.date)
        const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, row.id, row.date);
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
    } else if (props.lifecycleStage === LifecycleStageMap.ACTIVE || props.lifecycleStage === LifecycleStageMap.ARCHIVE) {
      navigateToDrawer(Routes.REGISTRY, props.recordType, recordId);
    }
    else {
      const registryRoute: string = isPermitted("edit") ? Routes.REGISTRY_EDIT : Routes.REGISTRY;
      navigateToDrawer(registryRoute, props.recordType, recordId);
    }
  };

  if (props.tableDescriptor.table.getVisibleLeafColumns().length > 0) {
    return (
      <div className="rounded-lg border border-border w-full mr-auto overflow-hidden fade-in-on-motion flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-auto table-scrollbar">
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
                    <HeaderRow
                      key={headerGroup.id}
                      triggerRefresh={props.triggerRefresh}
                    >
                      {headerGroup.headers.map((header, index) => {
                        const colDef: EnhancedColumnDef<FieldValues> = header.column.columnDef as EnhancedColumnDef<FieldValues>;
                        return (
                          <HeaderCell
                            key={header.id + index}
                            type={props.recordType}
                            table={props.tableDescriptor.table}
                            header={header}
                            lifecycleStage={props.lifecycleStage}
                            selectedDate={props.selectedDate}
                            filters={props.tableDescriptor.filters}
                            isEditable={props.tableDescriptor.isBulkDispatchEdit && colDef.stage === FormTypeMap.DISPATCH}
                            disableSort={colDef.dataType == "array"}
                            disableFilter={colDef.dataType == "array" ||
                              (props.lifecycleStage == LifecycleStageMap.BILLABLE && header.id == props.accountType)}
                          />
                        );
                      })}
                    </HeaderRow>
                  ))}
              </thead>
              <tbody>
                {props.tableDescriptor.table.getRowModel().rows?.length > 0 && (
                  <SortableContext
                    items={dragAndDropDescriptor.dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {props.tableDescriptor.table.getRowModel().rows.map(row => {
                      const recordId: string = getRowRecordId(row.original as FieldValues);
                      return (
                        <TableRow
                          key={recordId}
                          id={recordId}
                          row={row}
                          accountType={props.accountType}
                          disableRowAction={props.disableRowAction}
                          triggerRefresh={props.triggerRefresh}
                        >
                          {row.getVisibleCells().map((cell, index) => (
                            <TableCell
                              key={cell.id + index}
                              width={cell.column.getSize()}
                              className={`${props.tableDescriptor.isBulkDispatchEdit ? "cursor-default" : "cursor-pointer"}`}
                              onClick={props.tableDescriptor.isBulkDispatchEdit ? undefined : () => {
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
                      );
                    })}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
        <TablePagination rows={props.tableDescriptor.totalRows} table={props.tableDescriptor.table} pagination={props.tableDescriptor.pagination} />
      </div>
    );
  }
  return (
    <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
      {dict.message.noVisibleColumns}
    </div>
  );
}
