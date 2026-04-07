import useTableSession from "hooks/table/useTableSession";
import { useDictionary } from "hooks/useDictionary";

import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

const PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];

/**
 * A pagination component for the table.
 */
export default function TablePagination() {
  const dict: Dictionary = useDictionary();
  const { tableDescriptor } = useTableSession();

  const numberOfSelectedRows: number = tableDescriptor.table.getSelectedRowModel().rows.length;
  const lastPageIndex: number = Math.ceil(tableDescriptor.table.getRowCount() / tableDescriptor.pagination.pageSize);
  return (
    <div className="flex items-center justify-between p-2 bg-muted border-t border-border shrink-0">
      <div className="text-sm text-foreground">
        {dict.message.numberOfRecords
          .replace("{replace}", String(numberOfSelectedRows > 0 ? numberOfSelectedRows : Math.min(tableDescriptor.totalRows, tableDescriptor.table.getRowCount())))
          .replace("{replacetotal}", String(tableDescriptor.totalRows)
          )}
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-2">
            <span>{dict.message.rowsPerPage}</span>
            <select
              className="px-2 py-1.5 border border-border rounded bg-background"
              value={tableDescriptor.pagination.pageSize}
              onChange={(e) => {
                tableDescriptor.table.setPageSize(Number(e.target.value));
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
                String(tableDescriptor.pagination.pageIndex + 1)
              ).replace("{replacecount}", String(lastPageIndex))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon="keyboard_double_arrow_left"
            size="icon"
            className="hidden! md:flex!"
            onClick={() => tableDescriptor.table.setPageIndex(0)}
            disabled={tableDescriptor.pagination.pageIndex == 0}
            aria-label="Go to first page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_arrow_left"
            size="icon"
            onClick={() => tableDescriptor.table.previousPage()}
            disabled={tableDescriptor.pagination.pageIndex == 0}
            aria-label="Go to previous page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_arrow_right"
            size="icon"
            onClick={() => tableDescriptor.table.nextPage()}
            disabled={tableDescriptor.pagination.pageIndex == lastPageIndex - 1}
            aria-label="Go to next page"
          />
          <Button
            variant="outline"
            leftIcon="keyboard_double_arrow_right"
            className="hidden! md:flex!"
            size="icon"
            onClick={() => tableDescriptor.table.setPageIndex(lastPageIndex - 1)}
            disabled={tableDescriptor.pagination.pageIndex == lastPageIndex - 1}
            aria-label="Go to last page"
          />
        </div>
      </div>
    </div>
  );
}