import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ColumnFiltersState, flexRender, Table } from "@tanstack/react-table";
import { useFirstActiveFilter } from "hooks/table/useFirstActiveFilter";
import { useDictionary } from "hooks/useDictionary";
import { Routes } from "io/config/routes";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setCurrentEntityType } from "state/registry-slice";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import { getId } from "utils/client-utils";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction, {
  genTaskOption,
} from "../action/registry-row-action";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import TableRow from "../row/table-row";
import { parseRowsForFilterOptions } from "./registry-table-utils";
import { PermissionScheme } from "types/auth";
import { usePermissionScheme } from "hooks/auth/usePermissionScheme";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  data: FieldValues[];
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>;
  columnFilters: ColumnFiltersState;
  table: Table<FieldValues>;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {FieldValues[]} data The data to be displayed in the table.
 * @param setData A dispatch method to set the data for the table.
 * @param {ColumnFiltersState} columnFilters The current column filters state.
 * @param {Table<FieldValues>} table The TanStack Table instance.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const router = useRouter();
  const dispatch = useDispatch();
  const keycloakEnabled = process.env.KEYCLOAK === "true";
  const permissionScheme: PermissionScheme = usePermissionScheme();
  const { firstActiveFilter } = useFirstActiveFilter(props.columnFilters);

  // Data IDs to maintain the order of rows during drag and drop
  const dataIds: UniqueIdentifier[] = useMemo<UniqueIdentifier[]>(
    () => props.data?.map((row, index) => row.id + index) ?? [],
    [props.data]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const onRowClick = (row: FieldValues) => {
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
      // Update entity type to lifecycle stage for these stages
      dispatch(setCurrentEntityType(props.lifecycleStage));
      if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.operation) &&
        (row.status as string).toLowerCase() === dict.title.new
      ) {
        props.setTask(genTaskOption(recordId, row, "dispatch", dict));
      } else if (
        (!keycloakEnabled ||
          !permissionScheme ||
          permissionScheme.hasPermissions.completeTask) &&
        (row.status as string).toLowerCase() === dict.title.assigned
      ) {
        props.setTask(genTaskOption(recordId, row, "complete", dict));
      } else {
        props.setTask(genTaskOption(recordId, row, "default", dict));
      }
    } else {
      dispatch(setCurrentEntityType(props.recordType));
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

  // This function updates the data order (row order) based on the drag and drop interaction
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const currentPageIndex: number =
      props.table.getState().pagination.pageIndex;
    if (active && over && active.id !== over.id) {
      props.setData((prev) => {
        const oldIndex: number = dataIds.findIndex(
          (record) => record == active.id
        );
        const newIndex: number = dataIds.findIndex(
          (record) => record == over.id
        );
        // Hacky solution to reset pagination after reordering
        // A better solution is that pagination is stored in a state outside of this component and
        // we need to change the default pagination functionality in Tanstack as it is the source of this issue
        setTimeout(() => {
          props.table.setPageIndex(currentPageIndex);
        }, 0);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      {props.table.getVisibleLeafColumns().length > 0 ? (
        <>
          <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden ">
            {/* Table container */}
            <div className="overflow-auto flex-1 min-h-[400px]">
              <div className="min-w-full">
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                >
                  <table
                    aria-label={`${props.recordType} registry table`}
                    className="w-full border-separate border-spacing-0"
                  >
                    <thead className="bg-muted sticky top-0 z-10">
                      {props.table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          id={headerGroup.id}
                          isHeader={true}
                        >
                          <TableCell className="w-[calc(100%/20)]" />
                          {headerGroup.headers.map((header, index) => {
                            return (
                              <HeaderCell
                                key={header.id + index}
                                header={header}
                                options={Array.from(
                                  new Set(
                                    !firstActiveFilter ||
                                    firstActiveFilter === header.id
                                      ? parseRowsForFilterOptions(
                                          props.table.getCoreRowModel()
                                            .flatRows,
                                          header.id,
                                          dict.title.blank
                                        )
                                      : parseRowsForFilterOptions(
                                          props.table.getFilteredRowModel()
                                            .flatRows,
                                          header.id,
                                          dict.title.blank
                                        )
                                  )
                                )}
                              />
                            );
                          })}
                        </TableRow>
                      ))}
                    </thead>

                    <tbody>
                      {props.table.getRowModel().rows?.length > 0 && (
                        <SortableContext
                          items={dataIds}
                          strategy={verticalListSortingStrategy}
                        >
                          {props.table.getRowModel().rows.map((row, index) => (
                            <TableRow
                              key={row.id + index}
                              id={row.id}
                              isHeader={false}
                            >
                              <TableCell className="sticky left-0 z-20 bg-background group-hover:bg-muted cursor-default">
                                <div className="flex gap-1  ">
                                  <DragActionHandle id={row.id} />
                                  <RegistryRowAction
                                    recordType={props.recordType}
                                    lifecycleStage={props.lifecycleStage}
                                    row={row.original}
                                    setTask={props.setTask}
                                  />
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
          <TablePagination table={props.table} />
        </>
      ) : (
        <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
          {dict.message.noVisibleColumns}
        </div>
      )}
    </>
  );
}
