import { Column } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useCallback } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ColumnSortDropdownProps {
  columns: Column<FieldValues, unknown>[];
}

/**
 * A dropdown component for selecting which columns to sort by (ascending order).
 * Useful for sorting by working time of workers or other criteria.
 *
 * @param {Column<FieldValues, unknown>[]} columns The table columns available for sorting.
 */
export default function ColumnSort(props: Readonly<ColumnSortDropdownProps>) {
  const dict: Dictionary = useDictionary();

  const sortByName = useCallback(() => {
    // Find the "name" column by id or header label (case-insensitive)
    const nameCol = props.columns.find((col) => {
      const byId = col.id?.toString().toLowerCase() === "name";
      const header = col.columnDef.header;
      const byHeader =
        typeof header === "string" && header.toLowerCase() === "name";
      return (col.getCanSort?.() ?? true) && (byId || byHeader);
    });

    if (!nameCol) return;

    const currentSort = nameCol.getIsSorted();

    // Clear sorting on all other columns
    props.columns.forEach((col) => {
      if (col.id !== nameCol.id && col.getIsSorted()) {
        col.clearSorting();
      }
    });

    // Toggle behavior
    if (currentSort === "asc") {
      nameCol.clearSorting();
    } else {
      nameCol.toggleSorting(false); // false = ascending
    }
  }, [props.columns]);

  const currentSort = props.columns
    .find((col) => col.id === "name")
    ?.getIsSorted();

  return (
    <Button
      leftIcon="directions_bus"
      variant="secondary"
      onClick={sortByName}
      label="Sort drivers"
      className={` !p-2.5 ${currentSort === "asc" ? "!bg-primary " : ""}`}
    />
  );
}
