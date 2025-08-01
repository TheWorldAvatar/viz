import { Table } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form/dist/types/fields";
import Button from "ui/interaction/button";

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
  const { table } = props;
  return (
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
              <option className="bg-background" key={pageSize} value={pageSize}>
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
  );
}
