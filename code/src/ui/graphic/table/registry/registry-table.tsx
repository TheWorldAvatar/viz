import React from "react";
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

interface RegistryTableProps {
  recordType: string;
  lifecycleStage: LifecycleStage;
  instances: RegistryFieldValues[];
  setTask: React.Dispatch<React.SetStateAction<RegistryTaskOption>>;
  limit?: number;
}

const columnHelper = createColumnHelper<FieldValues>();

/**
 * This component renders a registry of table based on the inputs.
 *
 * @param {string} recordType The type of the record.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryFieldValues[]} instances The instance values for the table.
 * @param setTask A dispatch method to set the task option when required.
 * @param {number} limit Optional limit to the number of columns shown.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();

  // Generate TanStack Table columns
  const columns = React.useMemo(() => {
    if (props.instances?.length === 0) return [];

    // Actions column
    const actionsColumn = columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <RegistryRowActions
          recordType={props.recordType}
          lifecycleStage={props.lifecycleStage}
          row={info.row.original}
          setTask={props.setTask}
        />
      ),
      size: 60,
      meta: {
        className: "border-border border-r-[0.5px] shadow-2xl",
      },
    });

    // Get instances with the most number of fields to determine all possible columns
    const instanceWithMostFields = props.instances.reduce((prev, current) => {
      const prevKeys = Object.keys(prev).length;
      const currentKeys = Object.keys(current).length;
      return prevKeys >= currentKeys ? prev : current;
    });

    // Dynamic columns based on instance fields
    const dynamicColumns = Object.keys(instanceWithMostFields).map((field) => {
      const title = parseWordsForLabels(field);
      const minWidth = Math.max(
        title.length * 5, // Compute based on title length
        125 // Minimum width
      );

      return columnHelper.accessor(field, {
        header: () => title,
        cell: (info) => {
          const value = info.getValue();
          if (!value) return "";

          if (field.toLowerCase() === "status") {
            return <StatusComponent status={`${value}`} />;
          }

          return (
            <span style={{ color: "var(--foreground)" }}>
              {parseWordsForLabels(`${value}`)}
            </span>
          );
        },
        footer: (info) => info.column.id,
        size: minWidth,
        meta: {
          className: "border-b-1 border-border bg-muted",
        },
        sortingFn: (rowA, rowB, columnId) => {
          const aValue = rowA.getValue(columnId) as string;
          const bValue = rowB.getValue(columnId) as string;
          if (!aValue || !bValue) return 0;
          return aValue.localeCompare(bValue);
        },
      });
    });

    return [actionsColumn, ...dynamicColumns];
  }, [props.instances, props.recordType, props.lifecycleStage, props.setTask]);

  // Parse row values
  const data: FieldValues[] = React.useMemo(() => {
    if (props.instances?.length === 0) return [];
    // Extract only the value into the data to simplify
    return props.instances.map((instance, index) => {
      const flattenInstance: Record<string, string> = { key: `row-${index}` };
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
  }, [props.instances]); // Create TanStack Table instance
  const [expanded, setExpanded] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    enableExpanding: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle row expansion
  const handleRowClick = (row: any) => {
    row.toggleExpanded();
  };

  return (
    <div className="registry-table border border-border rounded-lg shadow-sm p-6 bg-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left font-medium text-gray-700 bg-gray-50"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="p-4 bg-gray-50 border-t"
                    >
                      <div className="text-sm text-gray-600">
                        <strong>Expanded row details for:</strong>{" "}
                        {JSON.stringify(row.original, null, 2)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          {data.length === 0
            ? dict.message.noData
            : `Showing ${
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
              } to ${Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length
              )} of ${data.length} entries`}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="px-3 py-1">
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {">>"}
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
