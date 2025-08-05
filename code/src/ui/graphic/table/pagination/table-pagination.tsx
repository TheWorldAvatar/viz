import { Table } from "@tanstack/react-table";

import { FieldValues } from "react-hook-form/dist/types/fields";
import Button from "ui/interaction/button";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

interface TablePaginationProps {
  table: Table<FieldValues>;
}

/**
 * A pagination component for the table.
 *
 * @param {Table<FieldValues>} props.table - The table instance.
 */

const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50];

export default function TablePagination(props: Readonly<TablePaginationProps>) {
  const dict: Dictionary = useDictionary();
  const { table } = props;
  return (
    <div className="flex items-center justify-between p-4 bg-muted border-t border-border flex-shrink-0">
      <div className="text-sm text-foreground">
        {dict.message.numberOfRecords
          .replace("{replace}", String(table.getFilteredRowModel().rows.length))
          .replace(
            "{replacetotal}",
            String(table.getCoreRowModel().rows.length)
          )}
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-2">
            <span>{dict.message.rowsPerPage}</span>
            <select
              className="px-2 py-1.5 border border-border rounded bg-background"
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
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm text-foreground">
            {dict.message.page
              .replace(
                "{replace}",
                String(table.getState().pagination.pageIndex + 1)
              )
              .replace("{replacecount}", String(table.getPageCount()))}
          </span>
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
  );
}
