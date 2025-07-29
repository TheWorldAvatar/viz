import { Column } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";

interface ColumnFilterDropdownProps {
  column: Column<FieldValues, unknown>;
  options: string[];
}

export default function ColumnFilterDropdown({
  column,
  options,
}: ColumnFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const selectedValues = (column.getFilterValue() as string[]) || [];
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    // Always set the filter value, even if it's an empty array
    column.setFilterValue(newValues);
  };

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
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return "All";
    } else if (selectedValues.length === options.length) {
      return "All";
    } else if (selectedValues.length === 1) {
      return selectedValues[0];
    } else {
      return `${selectedValues.length} selected`;
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 text-sm border border-border rounded bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-between cursor-pointer"
      >
        <span className="truncate">{getDisplayText()}</span>
        <span className="ml-1">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded shadow-lg max-h-48 w-fit overflow-y-auto min-w-[200px]">
          {/* Search input */}
          <div className="sticky top-0 left-0 p-2 border-b border-border bg-background">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          {/* Options list */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked(option)}
                  onChange={() => handleToggle(option)}
                  className="mr-2 flex-shrink-0"
                />
                <span className="break-words lg:truncate leading-relaxed">
                  {option}
                </span>
              </label>
            ))
          ) : (
            <div className="px-2 py-1 text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
