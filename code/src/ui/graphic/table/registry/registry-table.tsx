import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldValues } from "react-hook-form";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import RegistryRowActions from "./actions/registry-table-action";
import Button from "ui/interaction/button";
import ColumnFilterDropdown from "./column-filter-dropdown";
import ColumnVisabilityDropdown from "./column-visability-dropdown";
import TablePagination from "../pagination/table-pagination";
import TableRow from "./table-row";
import TableCell from "./table-cell";
import { Icon } from "@mui/material";

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

// Maybe use React.memo for performance optimization?
// so that it does not create new drag handles on every render?
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      leftIcon="drag_indicator"
      size="icon"
      variant="ghost"
      {...attributes}
      {...listeners}
      className="cursor-grab hover:cursor-grabbing hover:bg-transparent"
    >
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Draggable Row Component
// React.memo ?
function DraggableRow({
  row,
  children,
}: {
  row: Row<FieldValues>;
  children: React.ReactNode;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      className={`group relative z-0 ${isDragging ? "z-10 opacity-70" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {children}
    </TableRow>
  );
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  // Get unique values for each column for filtering
  const columnOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    if (props.instances?.length > 0) {
      // Generate options for each field
      Array.from(allFields).forEach((field) => {
        const uniqueValues = [
          ...new Set(
            props.instances
              .map((instance) => {
                const fieldValue = instance[field];
                if (Array.isArray(fieldValue)) {
                  return fieldValue[0]?.value || "";
                } else {
                  return fieldValue?.value || "";
                }
              })
              .filter((val) => val !== "") // Filter out empty values
          ),
        ];
        options[field] = uniqueValues.sort();
      });
    }

    return options;
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
        const isIdField = field.toLowerCase().includes("id");

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
          enableColumnFilter: !isIdField,
          filterFn: (row, columnId, filterValue: string[]) => {
            const value = row.getValue(columnId) as string;
            // If no filter is applied (undefined) or all values are selected, show all records
            if (
              !filterValue ||
              filterValue.length === 0 ||
              filterValue.length === columnOptions[field]?.length
            ) {
              return true;
            }
            // If the value is empty and no empty values are in the filter options, exclude it
            if (!value && filterValue.length > 0) {
              return false;
            }
            return filterValue.includes(value);
          },
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
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row, index) => `row-${index}`,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
    },
  });

  // Data IDs for drag and drop
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map((_, index) => `row-${index}`) || [],
    [data]
  );

  // Handle drag end
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
        }, 0); // Delay to ensure state updates correctly
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  // Function to get current filtered options for a column
  const getCurrentColumnOptions = useCallback(
    (columnId: string) => {
      if (!table) return columnOptions[columnId] || [];

      // Get all active filters except the current column
      const activeFilters = table
        .getState()
        .columnFilters.filter((filter) => filter.id !== columnId);

      // If no other filters are active, return all options
      if (activeFilters.length === 0) {
        return columnOptions[columnId] || [];
      }

      // Calculate available options based on other active filters
      const availableOptions = new Set<string>();

      // Go through all original data and check which values would be available
      // if we applied all other filters except the current column
      data.forEach((row) => {
        // Check if this row would pass all other active filters
        let passesOtherFilters = true;

        for (const filter of activeFilters) {
          const filterValue = filter.value as string[];
          const rowValue = row[filter.id] as string;

          // If no filter is applied or all values are selected, it passes
          if (
            !filterValue ||
            filterValue.length === 0 ||
            filterValue.length === columnOptions[filter.id]?.length
          ) {
            continue;
          }

          // If the value is empty and no empty values are in the filter options, exclude it
          if (!rowValue && filterValue.length > 0) {
            passesOtherFilters = false;
            break;
          }

          // Check if the row value is in the filter
          if (!filterValue.includes(rowValue)) {
            passesOtherFilters = false;
            break;
          }
        }

        // If this row passes all other filters, add its value for the current column
        if (passesOtherFilters) {
          const value = row[columnId] as string;
          if (value && value !== "") {
            availableOptions.add(value);
          }
        }
      });

      return Array.from(availableOptions).sort();
    },
    [table, data, columnOptions]
  );

  const hasRows = table.getRowModel().rows.length > 0;
  const hasVisibleColumns = table.getVisibleLeafColumns().length > 0;
  const hasActiveFilters = () => {
    return table.getState().columnFilters.some((filter) => {
      const value = filter.value as string[];
      return value?.length > 0;
    });
  };

  const handleClearAllFilters = useCallback(() => {
    table.resetColumnFilters();
    setColumnFilters([]);
  }, [table]);

  if (!hasRows && columnFilters.length === 0) {
    return (
      <div className="text-center py-6 text-foreground text-lg">
        {dict.message.noData}
      </div>
    );
  }

  return (
    <>
      {/* Column Visibility Dropdown */}
      {hasRows && <ColumnVisabilityDropdown table={table} />}

      <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden">
        {/* Table container */}
        {hasRows && (
          <div className="overflow-auto flex-1 min-h-[400px]">
            <div className="min-w-full">
              <DndContext
                key={`dnd-${table
                  .getVisibleLeafColumns()
                  .map((c) => c.id)
                  .join("-")}`}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
              >
                <table
                  aria-label={`${props.recordType} registry table`}
                  className="w-full border-collapse"
                >
                  <thead className="bg-muted sticky top-0 z-10">
                    {/* Combined Header and Filter row */}
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow isHeader={true} key={headerGroup.id}>
                        {hasVisibleColumns && (
                          <>
                            <TableCell isHeader={true} />
                            <TableCell isHeader={true} />
                          </>
                        )}
                        {headerGroup.headers.map((header) => (
                          <TableCell
                            key={header.id}
                            isHeader={true}
                            style={{
                              width: header.getSize(),
                              minWidth: header.getSize(),
                            }}
                          >
                            {header.isPlaceholder ? null : (
                              <div className="flex flex-col gap-2">
                                <div
                                  className={`flex items-center gap-2 ${
                                    header.column.getCanSort()
                                      ? "cursor-pointer select-none "
                                      : ""
                                  }`}
                                  onClick={header.column.getToggleSortingHandler()}
                                  aria-label={
                                    header.column.getCanSort()
                                      ? `Sort by ${header.column.columnDef.header}`
                                      : undefined
                                  }
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {{
                                    asc: (
                                      <Icon className="material-symbols-outlined">
                                        {"arrow_upward"}
                                      </Icon>
                                    ),
                                    desc: (
                                      <Icon className="material-symbols-outlined">
                                        {"arrow_downward"}
                                      </Icon>
                                    ),
                                  }[header.column.getIsSorted() as string] ??
                                    null}
                                </div>
                                {header.column.getCanFilter() ? (
                                  <ColumnFilterDropdown
                                    column={header.column}
                                    options={getCurrentColumnOptions(
                                      header.column.id
                                    )}
                                  />
                                ) : (
                                  <div className="h-11" />
                                )}
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </thead>
                  {/* Body rows */}
                  <tbody>
                    {table.getRowModel().rows?.length ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <DraggableRow key={row.id} row={row}>
                            {hasVisibleColumns && (
                              <>
                                <TableCell className="sticky left-0 z-20 bg-background group-hover:bg-muted">
                                  <DragHandle id={row.id} />
                                </TableCell>
                                <TableCell className="sticky left-12 z-20 bg-background group-hover:bg-muted">
                                  <RegistryRowActions
                                    recordType={props.recordType}
                                    lifecycleStage={props.lifecycleStage}
                                    row={row.original}
                                    setTask={props.setTask}
                                  />
                                </TableCell>
                              </>
                            )}
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                style={{
                                  width: cell.column.getSize(),
                                  minWidth: cell.column.getSize(),
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </DraggableRow>
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell>
                          <div className="h-24 text-center">
                            {dict.message.noData}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>
        )}

        {/* Clear all filters button */}
        {hasRows && hasActiveFilters() && (
          <div className="bg-muted border-t border-border p-2 flex justify-center">
            <Button
              leftIcon="filter_list_off"
              iconSize="small"
              onClick={handleClearAllFilters}
              variant="destructive"
            >
              {dict.action.clearAllFilters}
            </Button>
          </div>
        )}

        {/* Pagination */}
        {hasRows && <TablePagination table={table} />}

        {/* Empty states */}
        {!hasRows && columnFilters.length > 0 && (
          <div className="text-center py-8 text-foreground text-lg">
            {dict.message.noFilterResults}
          </div>
        )}
        {!hasVisibleColumns && (
          <div className="text-center text-md md:text-lg py-8 text-foreground">
            {dict.message.noVisibleColumns}
          </div>
        )}
      </div>
    </>
  );
}
