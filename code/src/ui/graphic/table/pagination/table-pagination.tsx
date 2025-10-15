import { PaginationState, Table } from "@tanstack/react-table";

import { useDictionary } from "hooks/useDictionary";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface TablePaginationProps {
  table: Table<FieldValues>;
  pagination: PaginationState;
}

/**
 * A pagination component for the table.
 *
 * @param {Table<FieldValues>} props.table - The table instance.
 */

const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50];

export default function TablePagination(props: Readonly<TablePaginationProps>) {
  const dict: Dictionary = useDictionary();
  return (
    <div className="flex items-center justify-between p-4 bg-muted border-t border-border flex-shrink-0">
      <div className="text-sm text-foreground">
        {dict.message.numberOfRecords
          .replace("{replace}", String(props.table.getRowCount()))
          .replace(
            "{replacetotal}",
            String(props.table.getRowCount())
          )}
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-2">
            <span>{dict.message.rowsPerPage}</span>
            <select
              className="px-2 py-1.5 border border-border rounded bg-background"
              value={props.pagination.pageSize}
              onChange={(e) => {
                props.table.setPageSize(Number(e.target.value));
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
                String(props.pagination.pageIndex + 1)
              )
              .replace("{replacecount}", String(props.table.getPageCount()))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon="keyboard_double_arrow_left"
            size="icon"
            className="!hidden md:!flex"
            onClick={() => props.table.setPageIndex(0)}
            disabled={props.pagination.pageIndex == 0}
            aria-label="Go to first page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_arrow_left"
            size="icon"
            onClick={() => props.table.previousPage()}
            disabled={props.pagination.pageIndex == 0}
            aria-label="Go to previous page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_arrow_right"
            size="icon"
            onClick={() => props.table.nextPage()}
            disabled={!props.table.getCanNextPage()}
            aria-label="Go to next page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_double_arrow_right"
            className="!hidden md:!flex"
            size="icon"
            onClick={() => props.table.setPageIndex(props.table.getPageCount() - 1)}
            disabled={!props.table.getCanNextPage()}
            aria-label="Go to last page"
          />
        </div>
      </div>
    </div>
  );
}
