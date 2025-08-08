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
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import React, { useEffect, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import Button from "ui/interaction/button";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import DragActionHandle from "../action/drag-action-handle";
import RegistryRowAction from "../action/registry-row-action";
import HeaderCell from "../cell/header-cell";
import TableCell from "../cell/table-cell";
import TablePagination from "../pagination/table-pagination";
import TableRow from "../row/table-row";
import ColumnVisabilityDropdown from "./column-visability-dropdown";

// Constants
const DEFAULT_PAGE_SIZE: number = 10;
const MIN_COLUMN_WIDTH: number = 125;
const CHARACTER_WIDTH: number = 15;

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {number} limit Optional limit to the number of columns shown.
 */

export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();

  // State for drag and drop functionality
  const [data, setData] = useState<FieldValues[]>([]);

  // Update data when props.instances changes
  // This is necessary to ensure the table reflects the latest instances.
  useEffect(() => {
    if (props.instances?.length === 0) {
      setData([]);
      return;
    }
    // Parse row values
    const parsedData = props.instances.map((instance, index) => {
      const flattenInstance: Record<string, string> = { id: `row-${index}` };
      Object.keys(instance).forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value;
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
      });
      return flattenInstance;
    });
    setData(parsedData);
  }, [props.instances]);

  // Get all unique fields from instances
  const allFields = useMemo(() => {
    if (!props.instances?.length) return new Set<string>();

    const fields = new Set<string>();
    props.instances.forEach((instance) => {
      Object.keys(instance).forEach((field) => fields.add(field));
    });
    return fields;
  }, [props.instances]);

  // Generate columns
  const columns: ColumnDef<FieldValues>[] = useMemo(() => {
    if (props.instances?.length === 0) return [];

    const fieldColumns: ColumnDef<FieldValues>[] = Array.from(allFields).map(
      (field) => {
        const title = parseWordsForLabels(field);
        const minWidth = Math.max(
          title.length * CHARACTER_WIDTH,
          MIN_COLUMN_WIDTH
        );

        return {
          accessorKey: field,
          header: title,
          cell: ({ getValue }) => {
            const value = getValue();
            if (!value) return "";

            if (field.toLowerCase() === "status") {
              return <StatusComponent status={`${value}`} />;
            }

            return (
              <div className="text-foreground">
                {parseWordsForLabels(`${value}`)}
              </div>
            );
          },
          size: minWidth,
          enableSorting: true,
        };
      }
    );

    return fieldColumns;
  }, [props.instances, props.recordType, props.lifecycleStage, props.setTask]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (_row, index) => `row-${index}`,
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
    },
  });

  // Data IDs for drag and drop
  // This is used to maintain the order of rows during drag and drop
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map((_, index) => `row-${index}`) || [],
    [data]
  );

  // This function handles the drag end event
  // It updates the data order (row order) based on the drag and drop interaction
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const currentPageIndex = table.getState().pagination.pageIndex;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        setTimeout(() => {
          // Reset pagination to the current page after reordering
          table.setPageIndex(currentPageIndex);
        }, 0);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <div className="flex justify-end gap-4">
        {table.getState().columnFilters.some((filter) => (filter?.value as string[])?.length > 0) && (
          <Button
            leftIcon="filter_list_off"
            iconSize="small"
            onClick={() => table.resetColumnFilters()}
            tooltipText={dict.action.clearAllFilters}
            variant="destructive"
          />)}
        <ColumnVisabilityDropdown table={table} />
      </div>

      {table.getVisibleLeafColumns().length > 0 ? <>
        <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden">
          {/* Table container */}
          <div className="overflow-auto flex-1 min-h-[400px]">
            <div className="min-w-full">
              <DndContext
                key={`dnd-${table
                  .getVisibleLeafColumns()
                  .map((c) => c.id)
                  .join("-")}`}
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
                      <TableRow key={headerGroup.id} id={headerGroup.id} isHeader={true} >
                        <TableCell width={100} />
                        {headerGroup.headers.map((header) => {
                          return <HeaderCell
                            key={header.id}
                            header={header}
                            options={Array.from(new Set(
                              table.getFilteredRowModel().flatRows.flatMap(row => row.getValue(header.id))))}
                          />
                        }
                        )}
                      </TableRow>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowModel().rows?.length && (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} id={row.id} isHeader={false} >
                            <TableCell width={100} className="flex sticky left-0 z-20 bg-background group-hover:bg-muted">
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
      </> : (
        <div className="text-center text-md md:text-lg py-8 text-foreground">
          {dict.message.noVisibleColumns}
        </div>
      )}
    </>
  );
}
