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

export type TableData = {
  data: FieldValues[];
  columns: ColumnDef<FieldValues>[];
}

/**
 * Parses raw data from API into table data format suitable for rendering.
 *
 * @param {RegistryFieldValues[]} instances Raw instances queried from knowledge graph
 * @param {string} translatedBlankText The translated blank text.
 */
export function parseDataForTable(instances: RegistryFieldValues[], translatedBlankText: string): TableData {
  const results: TableData = {
    data: [],
    columns: [],
  };
  if (instances?.length > 0) {
    const multiSelectFilter: FilterFnOption<FieldValues> = buildMultiFilterFnOption(translatedBlankText);
    let maxFieldLength: number = 0;
    instances.map(instance => {
      const flattenInstance: Record<string, string> = {};
      const fields: string[] = Object.keys(instance);
      const tempColumns: ColumnDef<FieldValues>[] = [];
      fields.forEach((field) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value;
        } else {
          flattenInstance[field] = fieldValue?.value;
        }
        // Whenever the number of fields in a row exceeds the current max number of fields,
        // update column definitions to follow the new max
        if (fields.length > maxFieldLength) {
          const title: string = parseWordsForLabels(field);
          const minWidth: number = Math.max(
            title.length * 15,
            125
          );
          tempColumns.push({
            accessorKey: field,
            header: title,
            cell: ({ getValue }) => {
              const value: string = getValue() as string;
              if (!value) return "";

              if (field.toLowerCase() === "status") {
                return <StatusComponent status={value} />;
              }

              return (
                <div className="text-foreground">
                  {parseWordsForLabels(value)}
                </div>
              );
            },
            filterFn: multiSelectFilter,
            size: minWidth,
            enableSorting: true,
          })
        }
      });
      results.data.push(flattenInstance);
      if (fields.length > maxFieldLength) {
        results.columns = tempColumns;
        maxFieldLength = fields.length;
      }
    });
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
  // Return translated status label if header is status. 
  return rows.flatMap((row) => header == "status" ? dict.title[(row.getValue(header) as string).replace(/^[A-Z]/, (firstChar) => firstChar.toLowerCase())]
    // Else return the value or default to blank value
    : row.getValue(header) ?? dict.title.blank);
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
