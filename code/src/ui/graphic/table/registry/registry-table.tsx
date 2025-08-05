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
import ColumnFilterDropdown from "./column-filter-dropdown";
import ColumnVisabilityDropdown from "./column-visability-dropdown";
import TablePagination from "../pagination/table-pagination";
import TableRow from "./table-row";
import TableCell from "./table-cell";
import { Icon } from "@mui/material";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

// Constants
const DEFAULT_PAGE_SIZE: number = 10;
const MIN_COLUMN_WIDTH: number = 125;
const CHARACTER_WIDTH: number = 15;

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
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
              <table
                aria-label={`${props.recordType} registry table`}
                className="w-full border-collapse"
              >
                <thead className="bg-muted sticky top-0 z-10">
                  {/* Combined Header and Filter row */}
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow isHeader={true} key={headerGroup.id}>
                      {hasVisibleColumns && <TableCell />}
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          isHeader={true}
                          style={{
                            width: header.getSize(),
                            minWidth: header.getSize(),
                          }}
                          scope="col"
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
                                <div className="h-8" />
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {hasVisibleColumns && (
                        <TableCell className="sticky left-0 z-10 bg-background w-16">
                          <RegistryRowActions
                            recordType={props.recordType}
                            lifecycleStage={props.lifecycleStage}
                            row={row.original}
                            setTask={props.setTask}
                          />
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          scope="row"
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
                    </TableRow>
                  ))}
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
