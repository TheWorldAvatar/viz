import { Table } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { parseWordsForLabels } from "utils/client-utils";
import Button from "ui/interaction/button";
import { useEffect, useState, useRef } from "react";

interface ColumnVisibilityDropdownProps {
  table: Table<FieldValues>;
}

/**
 * A dropdown component for toggling column visibility in a table.
 *
 * @param {Table<FieldValues>} props.table - The table instance containing columns.
 */

export default function ColumnVisibilityDropdown({
  table,
}: ColumnVisibilityDropdownProps) {
  const [isColumnVisibilityOpen, setIsColumnVisibilityOpen] = useState(false);
  const columnVisibilityRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnVisibilityRef.current &&
        !columnVisibilityRef.current.contains(event.target as Node)
      ) {
        setIsColumnVisibilityOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsColumnVisibilityOpen(false);
      }
    };

    if (isColumnVisibilityOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isColumnVisibilityOpen]);
  return (
    <div className="flex justify-end">
      <div className="relative" ref={columnVisibilityRef}>
        <Button
          onClick={() => setIsColumnVisibilityOpen(!isColumnVisibilityOpen)}
          variant="outline"
          leftIcon="view_column"
          aria-expanded={isColumnVisibilityOpen}
          aria-haspopup="true"
        >
          <span className="truncate">Customise Columns</span>
          <span aria-hidden="true" className="ml-2">
            {isColumnVisibilityOpen ? "▲" : "▼"}
          </span>
        </Button>

        {isColumnVisibilityOpen && (
          <div
            role="menu"
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 w-fit md:w-full overflow-y-auto min-w-[200px]"
          >
            {/* Toggle All */}
            <div className="sticky top-0 left-0 py-1 border-b border-border bg-background">
              <label className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  className="mr-2"
                  aria-label="Toggle all columns visibility"
                />
                <span className="font-medium text-lg">Toggle All</span>
              </label>
            </div>

            {/* Individual columns */}
            {table.getAllLeafColumns().map((column) => (
              <label
                key={column.id}
                className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="mr-2 flex-shrink-0"
                  aria-describedby={`option-${column.id}`}
                />
                <span
                  id={`option-${column.id}`}
                  className="break-words lg:truncate leading-relaxed text-lg"
                >
                  {column.id === "actions"
                    ? "Actions"
                    : parseWordsForLabels(column.id)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
