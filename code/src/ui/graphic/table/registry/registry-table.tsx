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
import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import React, { useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import Button from "ui/interaction/button";
import ColumnToggle from "../action/column-toggle";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction from "../action/registry-row-action";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import TableRow from "../row/table-row";
import { parseDataForTable, TableData } from "./registry-table-utils";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();

  const tableData: TableData = useMemo(
    () => parseDataForTable(props.instances),
    [props.instances]
  );
  const [data, setData] = useState<FieldValues[]>(tableData.data);
  const table: Table<FieldValues> = useReactTable({
    data,
    columns: tableData.columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.id,
  });

  // Data IDs to maintain the order of rows during drag and drop
  const dataIds: UniqueIdentifier[] = useMemo<UniqueIdentifier[]>(
    () => data?.map((row) => row.id) ?? [],
    [data]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // This function updates the data order (row order) based on the drag and drop interaction
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const currentPageIndex: number = table.getState().pagination.pageIndex;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
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
          table.setPageIndex(currentPageIndex);
        }, 0);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <div
        className={`${table.getVisibleLeafColumns().length > 0 ? "" : "h-60"} `}
      >
        {table
          .getState()
          .columnFilters.some(
            (filter) => (filter?.value as string[])?.length > 0
          ) && (
          <Button
            leftIcon="filter_list_off"
            iconSize="small"
            onClick={() => table.resetColumnFilters()}
            tooltipText={dict.action.clearAllFilters}
            variant="destructive"
          />
        )}
        <ColumnToggle columns={table.getAllLeafColumns()} />
      </div>

      {table.getVisibleLeafColumns().length > 0 ? (
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
                    className="w-full border-collapse"
                  >
                    <thead className="bg-muted sticky top-0 z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          id={headerGroup.id}
                          isHeader={true}
                        >
                          <TableCell className="w-[calc(100%/20)]" />
                          {headerGroup.headers.map((header) => {
                            return (
                              <HeaderCell
                                key={header.id}
                                header={header}
                                options={Array.from(
                                  new Set(
                                    table
                                      .getFilteredRowModel()
                                      .flatRows.flatMap((row) =>
                                        row.getValue(header.id)
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
                      {table.getRowModel().rows?.length && (
                        <SortableContext
                          items={dataIds}
                          strategy={verticalListSortingStrategy}
                        >
                          {table.getRowModel().rows.map((row, index) => (
                            <TableRow
                              key={row.id + index}
                              id={row.id}
                              isHeader={false}
                            >
                              <TableCell className="flex sticky left-0 z-20 bg-background group-hover:bg-muted">
                                <DragActionHandle id={row.id} />
                                <RegistryRowAction
                                  recordType={props.recordType}
                                  lifecycleStage={props.lifecycleStage}
                                  row={row.original}
                                  setTask={props.setTask}
                                />
                              </TableCell>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  width={cell.column.getSize()}
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
          <TablePagination table={table} />
        </>
      ) : (
        <div className="text-center text-md md:text-lg py-8 text-foreground">
          {dict.message.noVisibleColumns}
        </div>
      )}
    </>
  );
}
