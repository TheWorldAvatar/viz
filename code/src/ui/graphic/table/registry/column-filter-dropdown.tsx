import { Column } from "@tanstack/react-table";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { FieldValues } from "react-hook-form";

interface ColumnFilterDropdownProps {
  column: Column<FieldValues, unknown>;
  options: string[];
}

/**
 * A dropdown component for filtering table columns with checkboxes and search functionality.
 *
 * @param {Column} props.column - The column to filter.
 * @param {string[]} props.options - The options to display in the dropdown.
 */

export default function ColumnFilterDropdown({
  column,
  options,
}: ColumnFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedValues = (column.getFilterValue() as string[]) || [];

  // Close dropdown when clicking outside or pressing escape
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

  const handleToggle = useCallback(
    (value: string) => {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      column.setFilterValue(newValues);
    },
    [selectedValues, column]
  );

  // Determine if a checkbox should be checked
  const isChecked = (value: string) => {
    if (
      selectedValues === undefined ||
      selectedValues.length === options.length
    ) {
      return true;
    }
    if (selectedValues.length === 0) {
      return false;
    }
    // Otherwise, check if this specific value is in the selected values
    return selectedValues.includes(value);
  };

  // Get display text for the button
  const displayText = useMemo(() => {
    if (
      selectedValues.length === 0 ||
      selectedValues.length === options.length
    ) {
      return "All";
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  }, [selectedValues, options.length]);

  // Filter options based on search term
  const filteredOptionsBySearchTerm = useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 text-sm border border-border rounded bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-between cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="truncate">{displayText}</span>
        <span aria-hidden="true" className="ml-1">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded shadow-lg max-h-48 w-fit overflow-y-auto min-w-[200px]"
        >
          {/* Search input */}
          <div className="sticky top-0 left-0 p-2 border-b border-border bg-background">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Search filter options"
            />
          </div>
          {/* Options list */}
          {filteredOptionsBySearchTerm.length > 0 ? (
            filteredOptionsBySearchTerm.map((option) => (
              <label
                key={option}
                className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked(option)}
                  onChange={() => handleToggle(option)}
                  className="mr-2 flex-shrink-0"
                  aria-describedby={`option-${option}`}
                />
                <span
                  id={`option-${option}`}
                  className="break-words lg:truncate leading-relaxed"
                >
                  {option}
                </span>
              </label>
            ))
          ) : (
            <h5 className="px-2 py-1 text-sm text-foreground">
              No options found
            </h5>
          )}
        </div>
      )}
    </div>
  );
}
