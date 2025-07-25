import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  Column,
} from "@tanstack/react-table";
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

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

// Custom filter component for dropdown checkboxes
function ColumnFilterDropdown({
  column,
  options,
}: {
  column: Column<FieldValues, unknown>;
  options: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedValues = (column.getFilterValue() as string[]) || [];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm(""); // Clear search when closing
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    // Always set the filter value, even if it's an empty array
    column.setFilterValue(newValues);
  };

  // Determine if a checkbox should be checked
  const isChecked = (value: string) => {
    // If no filter is applied (undefined), all checkboxes should be checked
    if (selectedValues === undefined) {
      return true;
    }
    // If filter is an empty array, no checkboxes should be checked
    if (selectedValues.length === 0) {
      return false;
    }
    // Otherwise, check if this specific value is in the selected values
    return selectedValues.includes(value);
  };

  // Get display text for the button
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return "All";
    } else if (selectedValues.length === options.length) {
      return "All";
    } else if (selectedValues.length === 1) {
      return selectedValues[0];
    } else {
      return `${selectedValues.length} selected`;
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 text-sm border border-border rounded bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span className="truncate">{getDisplayText()}</span>
        <span className="ml-1">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded shadow-lg max-h-48 w-fit overflow-y-auto min-w-[200px]">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div className="p-1 max-h-32 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={isChecked(option)}
                    onChange={() => handleToggle(option)}
                    className="mr-2"
                  />
                  <span className="truncate">{option || "(empty)"}</span>
                </label>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // Parse row values
  const data: FieldValues[] = useMemo(() => {
    if (props.instances?.length === 0) return [];
    // Extract only the value into the data to simplify
    return props.instances.map((instance, index) => {
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
  }, [props.instances]);

  // Get unique values for each column for filtering
  const columnOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    if (data.length > 0) {
      Object.keys(data[0]).forEach((columnKey) => {
        if (columnKey !== "id") {
          const uniqueValues = [
            ...new Set(data.map((row) => row[columnKey]).filter(Boolean)),
          ];
          options[columnKey] = uniqueValues.sort();
        }
      });
    }

    return options;
  }, [data]);

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
        const minWidth = Math.max(title.length * 15, 125);
        const isIdField = field.toLowerCase() === "id";

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
            return filterValue.includes(value);
          },
        };
      }
    );

    // Add actions column at the beginning
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
      size: 60,
      enableSorting: false,
      enableColumnFilter: false,
    };

    return [actionsColumn, ...fieldColumns];
  }, [props.instances, props.recordType, props.lifecycleStage, props.setTask]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full rounded-lg border border-border flex flex-col h-full overflow-hidden">
      {/* Table container with fixed height and scroll */}
      <div className="overflow-auto flex-1 min-h-[400px]">
        <div className="min-w-full">
          <table className="w-full border-collapse">
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
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
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
                {table.getAllColumns().map((column) => (
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
                        options={columnOptions[column.id] || []}
                      />
                    ) : (
                      <div className="h-8" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-background hover:bg-muted/50 border-b border-border"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-r border-border p-3 whitespace-nowrap"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear all filters button */}
      {columnFilters.length > 0 && (
        <div className="bg-muted border-t border-border p-2 flex justify-center">
          <Button onClick={() => setColumnFilters([])} variant="destructive">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination - fixed at bottom */}
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
              className="hidden md:block px-2 py-1 border border-border rounded bg-background"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="hidden md:block px-3 py-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="px-3 py-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className="px-3 py-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="hidden md:block px-3 py-1 border border-border rounded bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-8 text-foreground">
          {columnFilters.length > 0
            ? "No results match your filters. Try adjusting your search criteria."
            : dict.message.noData}
        </div>
      )}
    </div>
  );
}
