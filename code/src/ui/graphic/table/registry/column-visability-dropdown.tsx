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
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Filter columns based on search term
  const filteredColumns = table.getAllLeafColumns().filter((column) => {
    const columnLabel =
      column.id === "actions" ? "Actions" : parseWordsForLabels(column.id);
    return columnLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const showToggleAll = "Toggle All"
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const hasAnyResults = showToggleAll || filteredColumns.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex justify-end">
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          leftIcon="view_column"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate">Customise Columns</span>
          <span aria-hidden="true" className="ml-2">
            {isOpen ? "▲" : "▼"}
          </span>
        </Button>

        {isOpen && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 w-fit md:w-full overflow-y-auto min-w-[200px]"
          >
            {/* Search input */}
            <div className="sticky top-0 left-0 p-2 border-b border-border bg-background">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search columns..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Search columns"
              />
            </div>

            {/* Toggle All */}
            {showToggleAll && (
              <div className="py-1 border-b border-border bg-background">
                <div className="flex items-center  hover:bg-muted px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={table.getIsAllColumnsVisible()}
                    onChange={table.getToggleAllColumnsVisibilityHandler()}
                    className="mr-2"
                    aria-label="Toggle all columns visibility"
                    id="toggle-all-columns"
                  />
                  <label
                    htmlFor="toggle-all-columns"
                    className="font-medium text-lg"
                  >
                    Toggle All
                  </label>
                </div>
              </div>
            )}

            {/* Individual columns */}
            {filteredColumns.length > 0 &&
              filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center px-2 py-1 hover:bg-muted text-sm"
                >
                  <input
                    id={`column-${column.id}`}
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="mr-2 flex-shrink-0"
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="break-words lg:truncate leading-relaxed text-lg"
                  >
                    {column.id === "actions"
                      ? "Actions"
                      : parseWordsForLabels(column.id)}
                  </label>
                </div>
              ))}

            {/* No results message */}
            {!hasAnyResults && (
              <div className="px-2 py-3 text-sm text-foreground text-center">
                No columns found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
