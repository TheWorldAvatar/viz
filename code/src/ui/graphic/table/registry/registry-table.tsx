import React, { useMemo, useState, useCallback } from "react";
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
// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
  type Modifier,
  type CollisionDetection,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
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

// Cell Component for drag handle
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });
  return (
    <button
      {...attributes}
      {...listeners}
      className="cursor-grab hover:cursor-grabbing p-1"
      aria-label="Drag to reorder"
    >
      ⋮⋮
    </button>
  );
};

// Draggable Row Component
const DraggableRow = ({ row }: { row: Row<FieldValues> }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 0,
    position: "relative",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="bg-background hover:bg-muted/50 border-b border-border"
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={`border-r border-border p-3 whitespace-nowrap ${
            cell.column.id === "actions"
              ? "sticky left-0 z-10 bg-background"
              : ""
          }`}
          scope={cell.column.id === "actions" ? "row" : undefined}
          style={{
            width: cell.column.getSize(),
            minWidth: cell.column.getSize(),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

// Constants
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const MIN_COLUMN_WIDTH = 125;
const CHARACTER_WIDTH = 15;
const ACTIONS_COLUMN_WIDTH = 60;

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
  const [dragData, setDragData] = useState<FieldValues[]>([]);

  // Parse row values and set drag data
  React.useEffect(() => {
    if (props.instances?.length === 0) {
      setDragData([]);
      return;
    }

    // Extract only the value into the data to simplify
    const parsedData = props.instances.map((instance, index) => {
      const flattenInstance: Record<string, string> = { id: `row-${index}` };
      Object.keys(instance).forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value; // Handle array of SparqlResponseField
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
      });
      return flattenInstance;
    });
    setDragData(parsedData);
  }, [props.instances]);

  // Use dragData instead of processing instances directly
  const data: FieldValues[] = dragData;

  // Get unique values for each column for filtering
  const columnOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    if (props.instances?.length > 0) {
      // Get all unique fields from instances (same as in columns generation)
      const allFields = new Set<string>();
      props.instances.forEach((instance) => {
        Object.keys(instance).forEach((field) => allFields.add(field));
      });

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

    // Get all unique fields from instances
    const allFields = new Set<string>();
    props.instances.forEach((instance) => {
      Object.keys(instance).forEach((field) => allFields.add(field));
    });

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
              <div className="text-lg text-foreground">
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

    // Action buttons a
    const actionsColumn: ColumnDef<FieldValues> = {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RegistryRowActions
          recordType={props.recordType}
          lifecycleStage={props.lifecycleStage}
          row={row.original}
          setTask={props.setTask}
        />
      ),
      size: ACTIONS_COLUMN_WIDTH,
      enableSorting: false,
      enableColumnFilter: false,
    };

    // Drag handle column
    const dragHandleColumn: ColumnDef<FieldValues> = {
      id: "drag-handle",
      header: "Move",
      cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
      size: 60,
      enableSorting: false,
      enableColumnFilter: false,
    };

    return [dragHandleColumn, actionsColumn, ...fieldColumns];
  }, [props.instances, props.recordType, props.lifecycleStage, props.setTask]);

  // Data IDs for drag and drop - use row IDs based on current order
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => dragData?.map((_, index) => `row-${index}`) || [],
    [dragData]
  );

  // Custom collision detection to prevent scrolling beyond table bounds
  const customCollisionDetection: CollisionDetection = (args) => {
    // Use closestCenter but limit to only existing sortable items
    // This prevents the auto-scroll behavior when dragging beyond the last row
    const closestCenterCollisions = closestCenter(args);

    // Filter collisions to only include sortable items (rows)
    return closestCenterCollisions.filter((collision) =>
      dataIds.includes(collision.id)
    );
  };

  // Custom modifier to restrict dragging within table bounds
  const restrictToTableContainer: Modifier = ({
    transform,
    draggingNodeRect,
    containerNodeRect,
  }) => {
    if (!draggingNodeRect || !containerNodeRect) {
      return transform;
    }

    // Don't allow dragging beyond the table container
    const minY = containerNodeRect.top - draggingNodeRect.top;
    const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;

    return {
      ...transform,
      y: Math.min(Math.max(transform.y, minY), maxY),
    };
  };

  // Drag and drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setDragData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
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
    getRowId: (row, index) => `row-${index}`, // Use current index for row IDs
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
    },
  });

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
      dragData.forEach((row) => {
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
    [table, dragData, columnOptions]
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
    <DndContext
      collisionDetection={customCollisionDetection}
      modifiers={[restrictToVerticalAxis, restrictToTableContainer]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      autoScroll={{
        threshold: { x: 0.2, y: 0.2 },
        acceleration: 5,
        canScroll: () => true, // Disable auto-scrolling completely
      }}
    >
      {/* Column Visibility Dropdown */}
      {hasRows && <ColumnVisabilityDropdown table={table} />}

      <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden">
        {/* Table container */}
        {hasRows && (
          <div className="overflow-auto flex-1 min-h-[400px]">
            <div className="min-w-full">
              <table
                aria-label={`${props.recordType} registry table`}
                className="w-full border-collapse"
              >
                <thead className="bg-muted sticky top-0 z-10">
                  {/* Header row */}
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-border">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-r border-border bg-muted text-lg font-semibold text-foreground p-3 text-left whitespace-nowrap"
                          style={{
                            width: header.getSize(),
                            minWidth: header.getSize(),
                          }}
                          scope="col"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center ${
                                header.column.getCanSort()
                                  ? "cursor-pointer select-none hover:text-primary transition-colors"
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
                                asc: " ▲",
                                desc: " ▼",
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                  {/* Filter row */}
                  <tr className="border-b border-border">
                    {table.getVisibleLeafColumns().map((column) => (
                      <th
                        key={column.id}
                        className="border-r border-border bg-muted p-2"
                        style={{
                          width: column.getSize(),
                          minWidth: column.getSize(),
                        }}
                      >
                        {column.getCanFilter() ? (
                          <ColumnFilterDropdown
                            column={column}
                            options={getCurrentColumnOptions(column.id)}
                          />
                        ) : (
                          <div className="h-8" />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Body rows */}
                <tbody className="relative">
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
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
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {hasRows && (
          <div className="flex items-center justify-between p-4 bg-muted border-t border-border flex-shrink-0">
            <div className="text-sm text-foreground">
              {table.getFilteredRowModel().rows.length} of{" "}
              {table.getCoreRowModel().rows.length} total
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <select
                  className="hidden md:block px-2 py-1.5 border border-border rounded bg-background"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  aria-label="Select page size"
                >
                  {PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <option
                      className="bg-background"
                      key={pageSize}
                      value={pageSize}
                    >
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  leftIcon="keyboard_double_arrow_left"
                  size="icon"
                  className="!hidden md:!flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                />
                <Button
                  variant="outline"
                  leftIcon="keyboard_arrow_left"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                />
                <Button
                  variant="outline"
                  leftIcon="keyboard_arrow_right"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                />
                <Button
                  variant="outline"
                  leftIcon="keyboard_double_arrow_right"
                  className="!hidden md:!flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                />
              </div>
            </div>
          </div>
        )}

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
    </DndContext>
  );
}
