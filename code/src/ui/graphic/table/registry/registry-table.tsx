import {
  closestCenter,
  DndContext
} from "@dnd-kit/core";
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
import { useRouter } from "next/navigation";
import React from "react";
import { FieldValues } from "react-hook-form";
import { useDispatch } from "react-redux";
import { openDrawer } from "state/drawer-component-slice";
import { PermissionScheme } from "types/auth";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import { JsonObject } from "types/json";
import DraftTemplateButton from "ui/interaction/action/draft-template/draft-template-button";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import { toast } from "ui/interaction/action/toast/toast";
import Button from "ui/interaction/button";
import Checkbox from "ui/interaction/input/checkbox";
import { getId } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction, {
  genTaskOption,
} from "../action/registry-row-action";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import TableRow from "../row/table-row";
import { parseRowsForFilterOptions } from "./registry-table-utils";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  tableDescriptor: TableDescriptor;
  triggerRefresh: () => void;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const dispatch = useDispatch();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState<boolean>(false);

  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor.table,
    props.tableDescriptor.data,
    props.tableDescriptor.setData
  );

  const { isLoading, startLoading, stopLoading } = useOperationStatus();
  const numberOfSelectedRows: number = props.tableDescriptor.table.getSelectedRowModel().rows.length;
  const hasAmendedStatus: boolean = props.tableDescriptor.table.getSelectedRowModel().rows.some(
    row => (row.original.status as string)?.toLowerCase() === "amended"
  );
  const allowMultipleSelection: boolean = props.lifecycleStage !== "general";

  const onRowClick = (row: FieldValues) => {
    if (isLoading) return;
    const recordId: string = row.event_id
      ? row.event_id
      : row.id
        ? getId(row.id)
        : row.iri;
    if (
      props.lifecycleStage === "tasks" ||
      props.lifecycleStage === "report" ||
      props.lifecycleStage === "outstanding" ||
      props.lifecycleStage === "scheduled" ||
      props.lifecycleStage === "closed"
    ) {
      if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.operation) &&
        ((row.status as string).toLowerCase() === "new" ||
          ((row.status as string).toLowerCase() === "assigned" && props.lifecycleStage === "scheduled")
        )) {
        props.setTask(genTaskOption(recordId, row, "dispatch", dict.title.scheduleType));
      } else if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.completeTask) &&
        (row.status as string).toLowerCase() === "assigned"
      ) {
        props.setTask(genTaskOption(recordId, row, "complete", dict.title.scheduleType));
      } else {
        props.setTask(genTaskOption(recordId, row, "default", dict.title.scheduleType));
      }
      dispatch(openDrawer());
    } else {
      const registryRoute: string =
        !keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.operation ||
          permissionScheme.hasPermissions.sales
          ? Routes.REGISTRY_EDIT
          : Routes.REGISTRY;
      router.push(`${registryRoute}/${props.recordType}/${recordId}`);
    }
  };

  const handleBulkAction = async (action: "approve" | "resubmit") => {
    const selectedRows = props.tableDescriptor.table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map(row => row.original.id);

    let reqBody: JsonObject;
    let apiUrl: string;
    let method: string;

    switch (action) {
      case "approve":
        reqBody = {
          contract: contractIds,
          remarks: `${contractIds.length} contract(s) approved successfully!`,
        };
        apiUrl = makeInternalRegistryAPIwithParams("event", "service", "commence");
        method = "POST";
        break;
      case "resubmit":
        reqBody = {
          contract: contractIds,
        };
        apiUrl = makeInternalRegistryAPIwithParams("event", "draft", "reset");
        method = "PUT";
        break;
      default:
        throw new Error("Invalid action");
    }
    startLoading();
    const res = await fetch(
      apiUrl,
      {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify(reqBody),
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
    <>
      {props.tableDescriptor.table.getVisibleLeafColumns().length > 0 ? (
        <>
          <div className="w-full rounded-lg border border-border flex flex-col  h-full overflow-hidden">
            {/* Table container */}
            <div className="overflow-auto flex-1 min-h-[400px] table-scrollbar ">
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
                                {numberOfSelectedRows > 0 &&
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
                                      {props.lifecycleStage === "pending" &&
                                        <>
                                          <Button
                                            leftIcon="done_outline"
                                            label={dict.action.approve}
                                            variant="ghost"
                                            disabled={isLoading}
                                            onClick={() => handleBulkAction("approve")}
                                          />
                                          {hasAmendedStatus && <Button
                                            leftIcon="published_with_changes"
                                            label={dict.action.resubmit}
                                            variant="ghost"
                                            disabled={isLoading}
                                            onClick={() => handleBulkAction("resubmit")}
                                          />}
                                        </>
                                      }
                                      {(!keycloakEnabled ||
                                        !permissionScheme ||
                                        permissionScheme.hasPermissions.draftTemplate) &&
                                        <DraftTemplateButton
                                          rowId={props.tableDescriptor.table.getSelectedRowModel().rows.map(row => row.original.id)}
                                          recordType={props.recordType}
                                          triggerRefresh={props.triggerRefresh}
                                          resetRowSelection={props.tableDescriptor.table.resetRowSelection}
                                        />}
                                    </div>
                                  </PopoverActionButton>
                                }
                                {allowMultipleSelection && <Checkbox
                                  ariaLabel={dict.action.selectAll}
                                  disabled={isLoading}
                                  checked={props.tableDescriptor.table.getIsAllPageRowsSelected()}
                                  onChange={(checked) => {
                                    props.tableDescriptor.table.getRowModel().rows.forEach(row => {
                                      row.toggleSelected(checked);
                                    });
                                  }}
                                />}
                              </div>
                            </TableCell>
                            {headerGroup.headers.map((header, index) => {
                              return (
                                <HeaderCell
                                  key={header.id + index}
                                  header={header}
                                  options={Array.from(
                                    new Set(
                                      parseRowsForFilterOptions(
                                        !props.tableDescriptor
                                          .firstActiveFilter ||
                                          props.tableDescriptor
                                            .firstActiveFilter === header.id
                                          ? props.tableDescriptor.table.getCoreRowModel()
                                            .flatRows
                                          : props.tableDescriptor.table.getFilteredRowModel()
                                            .flatRows,
                                        header.id,
                                        dict
                                      )
                                    )
                                  )}
                                  resetRowSelection={props.tableDescriptor.table.resetRowSelection}
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
                                    setTask={props.setTask}
                                    triggerRefresh={props.triggerRefresh}
                                  />
                                  {allowMultipleSelection && <Checkbox ariaLabel={row.id} className="ml-2" disabled={isLoading} checked={row.getIsSelected()} onChange={(checked) => row.toggleSelected(checked)} />}
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
          <TablePagination table={props.tableDescriptor.table} />
        </>
      ) : (
        <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
          {dict.message.noVisibleColumns}
        </div>
      )}
    </>
  );
}
