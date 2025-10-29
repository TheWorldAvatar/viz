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
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
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
 * @param { Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseDataForTable(instances: RegistryFieldValues[], titleDict: Record<string, string>): TableData {
  const results: TableData = {
    data: [],
    columns: [],
  };
  if (instances?.length > 0) {
    const multiSelectFilter: FilterFnOption<FieldValues> = buildMultiFilterFnOption(titleDict.blank);
    const columnNames: string[] = [];
    instances.forEach(instance => {
      const flattenInstance: Record<string, string> = {};
      const fields: string[] = Object.keys(instance);

      fields.forEach((field, index) => {
        const fieldValue = instance[field];
        if (Array.isArray(fieldValue)) {
          flattenInstance[field] = fieldValue[0]?.value;
        } else {
          flattenInstance[field] = fieldValue?.value;
        }

        const normalizedField = field === "lastModified" ? titleDict.lastModified : field;

        if (field === "lastModified") {
          flattenInstance[normalizedField] = new Date(flattenInstance[field]).toLocaleString();
          delete flattenInstance[field];
        }

        if (!columnNames.includes(normalizedField)) {
          // Insert at the current index if possible, else push to end
          const insertIndex = Math.min(index, columnNames.length);
          columnNames.splice(insertIndex, 0, normalizedField);
        }
      });

      results.data.push(flattenInstance);
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
function buildMultiFilterFnOption(translatedBlankText: string): FilterFnOption<FieldValues> {
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
  // Return the actual row value (not translated label) for proper filtering
  // This is because the filter function checks against actual value, not the label
  // e.g. status value is "new" but label is "open"
  // So if we return the label here, filtering won't work as expected
  return rows.flatMap((row) => row.getValue(header) ?? dict.title.blank);
}

/**
 * Parses the options into the required select options.
 *
 * @param {string} header Current header name header of interest.
 * @param {string[]} options Input list of options.
 * @param {Dictionary} dict Dictionary translations.
 */
export function parseSelectOptions(header: string, options: string[], dict: Dictionary): SelectOption[] {
  // Returns null if options are undefined
  return options?.sort().map((col) => {
    // For status column, show translated label but use actual value
    // This is because the filter function checks against actual value, not the label
    const label: string = header === "status" ? dict.title[col.toLowerCase()] : col;
    return {
      label: label,
      value: col,
    };
  });
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
