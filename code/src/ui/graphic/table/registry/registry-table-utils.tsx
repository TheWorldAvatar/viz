import {
  ColumnDef,
  FilterFnOption,
  Row
} from "@tanstack/react-table";
import { DateBefore } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues
} from "types/form";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";

export type TableData = {
  data: FieldValues[];
  columns: ColumnDef<FieldValues>[];
}

/**
 * Parses raw data from API into table data format suitable for rendering.
 *
 * @param {RegistryFieldValues[]} instances Raw instances queried from knowledge graph
 * @param { Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseDataForTable(instances: RegistryFieldValues[], titleDict: Record<string, string>): TableData {
  const results: TableData = {
    data: [],
    columns: [],
  };
  if (instances?.length > 0) {
    const multiSelectFilter: FilterFnOption<FieldValues> = buildMultiFilterFnOption(titleDict.blank);
    let columnNames: Set<string> = new Set<string>();
    let maxFieldLength: number = 0;
    instances.map(instance => {
      const flattenInstance: Record<string, string> = {};
      const fields: string[] = Object.keys(instance);
      const tempColumns: Set<string> = new Set<string>();
      fields.forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value;
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
        // Update last modified field to translated title format
        if (field === "lastModified") {
          flattenInstance[titleDict.lastModified] = new Date(flattenInstance[field]).toLocaleString();
          delete flattenInstance[field]
        }
        // Whenever the number of fields in a row exceeds the current max number of fields,
        // add column field to a temporary set
        if (fields.length > maxFieldLength) {
          tempColumns.add(field === "lastModified" ? titleDict.lastModified : field);
        }
      });
      results.data.push(flattenInstance);
      // Merge additional columns with existing main set
      if (fields.length > maxFieldLength) {
        columnNames = new Set([...columnNames, ...tempColumns]);
        maxFieldLength = fields.length;
      }
    });
    // Create column definitions based on available columns
    for (const col of columnNames) {
      const title: string = parseWordsForLabels(col);
      const minWidth: number = Math.max(
        title.length * 15,
        125
      );
      results.columns.push({
        accessorKey: col,
        header: title,
        cell: ({ getValue }) => {
          const value: string = getValue() as string;
          if (!value) return "";

          if (col.toLowerCase() === "status") {
            return <StatusComponent status={value} />;
          }

          return (
            <ExpandableTextCell text={parseWordsForLabels(value)} maxLengthText={80} />
          );
        },
        filterFn: multiSelectFilter,
        size: minWidth,

        enableSorting: true,
      });
    }
  }
  return results;
}

/**
 * Builds a custom filter function to filter for multiple values when selected.
 * 
 * @param {string} translatedBlankText The translated blank text.
 */
export function buildMultiFilterFnOption(translatedBlankText: string): FilterFnOption<FieldValues> {
  return (
    row,
    columnId,
    filterValue: string[],
  ) => {
    if (!filterValue.length) return true;
    const rowValue: string = row.getValue(columnId);
    if (rowValue === undefined) {
      return filterValue.includes(translatedBlankText);
    }
    return !!filterValue.find((option) => option === rowValue);
    // Shouldn't be cleaner if we just check if the filterValue includes the rowValue ?
    // return filterValue.includes(rowValue);
  };
}

/**
 * Parses the rows obtained from TanStack into filtering options.
 *
 * @param {Row<FieldValues>[]} instances Raw instances queried from knowledge graph.
 * @param {string} header Column header of interest.
 * @param {Dictionary} dict Dictionary translations.
 */
export function parseRowsForFilterOptions(rows: Row<FieldValues>[], header: string, dict: Dictionary): string[] {
  // Return the actual row value (not translated label) for proper filtering
  // This is because the filter function checks against actual value, not the label
  // e.g. status value is "new" but label is "open"
  // So if we return the label here, filtering won't work as expected
  return rows.flatMap((row) => row.getValue(header) ?? dict.title.blank);
}

/**
 * Function to get disabled date range based on lifecycle stage.
 *
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 */
export function getDisabledDates(lifecycleStage: LifecycleStage): DateBefore {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  // For scheduled stage, only dates from tomorrow onwards should be available
  // and previous days should be disabled
  if (lifecycleStage === "scheduled") {
    return { before: tomorrow };
  }
  return undefined;
}
