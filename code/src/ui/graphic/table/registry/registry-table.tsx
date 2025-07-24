import React, { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
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
  const [sorting, setSorting] = React.useState<SortingState>([]);

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
    };

    return [actionsColumn, ...fieldColumns];
  }, [props.instances, props.recordType, props.lifecycleStage, props.setTask]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <div className="min-w-full">
        <table className="w-full border-collapse">
          <thead className="bg-muted sticky top-0 z-10">
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
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 bg-muted border-t border-border">
        <div className="text-sm text-foreground">
          {table.getFilteredRowModel().rows.length} total
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
          {dict.message.noData}
        </div>
      )}
    </div>
  );
}
