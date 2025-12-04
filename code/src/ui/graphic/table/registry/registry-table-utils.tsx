import {
  ColumnDef,
  ColumnFilter,
  FilterFnOption,
  SortingState
} from "@tanstack/react-table";
import { DateBefore } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import {
  LifecycleStage,
  RegistryFieldValues,
  SparqlResponseField
} from "types/form";
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";
import StatusComponent from "ui/text/status/status";
import { parseWordsForLabels } from "utils/client-utils";

const XSD_DATETIME = "http://www.w3.org/2001/XMLSchema#dateTime";
const XSD_DATE = "http://www.w3.org/2001/XMLSchema#date";
const XSD_TIME = "http://www.w3.org/2001/XMLSchema#time";

export type TableData = {
  data: FieldValues[];
  columns: ColumnDef<FieldValues>[];
}

/**
 * Parses the column filters into URL parameters for API querying.
 *
 * @param { ColumnFilter[]} filters Target filters for parsing.
 * @param {string} translatedBlankText The translated blank text.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseColumnFiltersIntoUrlParams(filters: ColumnFilter[], translatedBlankText: string, titleDict: Record<string, string>): string {
  const remainingFilters: ColumnFilter[] = filters.filter(filter => (filter.value as string[])?.length > 0);
  return remainingFilters.length === 0 ? "" : filters.map(filter => {
    if (filter.value === undefined || (filter.value as string[]).length === 0) {
      return "";
    }
    const currentFilterValues: string[] = filter.value as string[];
    let filterParams: string[];
    if (currentFilterValues.includes(translatedBlankText)) {
      filterParams = [...currentFilterValues.filter(val => val != translatedBlankText), "null"];
    } else {
      filterParams = currentFilterValues;
    }
    return `%7E${parseTranslatedFieldToOriginal(filter.id, titleDict)}=${filterParams.join("%7C")}`
  }).join("");
}

/**
 * Parses raw data from API into table data format suitable for rendering.
 *
 * @param {RegistryFieldValues[]} instances Raw instances queried from knowledge graph
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseDataForTable(instances: RegistryFieldValues[], titleDict: Record<string, string>): TableData {
  const results: TableData = {
    data: [],
    columns: [],
  };
  if (instances?.length > 0) {
    const multiSelectFilter: FilterFnOption<FieldValues> = buildMultiFilterFnOption(titleDict.blank);
    const columnNames: string[] = [];
    // Track column dataTypes 
    const columnDataTypes: Record<string, string> = {};

    instances.forEach(instance => {
      const flattenInstance: Record<string, string> = {};
      const fields: string[] = Object.keys(instance);

      fields.forEach((field, index) => {
        const fieldValue: SparqlResponseField | SparqlResponseField[] = instance[field];
        let firstValue: SparqlResponseField;

        if (Array.isArray(fieldValue)) {
          firstValue = fieldValue[0];
        } else {
          firstValue = fieldValue;
        }

        flattenInstance[field] = firstValue?.value;

        const normalizedField: string = parseLifecycleFieldsToTranslations(field, flattenInstance, titleDict);

        // Store the dataType using the normalized field name only if not already stored
        if (firstValue?.dataType && !columnDataTypes[normalizedField]) {
          columnDataTypes[normalizedField] = firstValue.dataType;
        }

        if (!columnNames.includes(normalizedField)) {
          // Insert at the current index if possible, else push to end
          const insertIndex: number = Math.min(index, columnNames.length);
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
      const dataType: string = columnDataTypes[col];
      const isDateTimeColumn: boolean = isDateTimeType(dataType);
      results.columns.push({
        accessorKey: col,
        header: title,
        cell: ({ getValue }) => {
          const value: string = getValue() as string;
          if (!value) return "";

          // Format datetime/date/time columns for display
          if (isDateTimeColumn) {
            return formatDateTimeValue(value, dataType);
          }

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
        sortDescFirst: true,
        sortingFn: isDateTimeColumn ? "datetime" : undefined,
      });
    }
  }
  return results;
}

/**
 * Checks if a dataType is a datetime, date, or time type.
 *
 * @param {string} dataType The XSD dataType from the backend.
 */
function isDateTimeType(dataType: string): boolean {
  return dataType === XSD_DATETIME || dataType === XSD_DATE || dataType === XSD_TIME;
}

/**
 * Formats a datetime/date/time value for display based on its dataType.
 *
 * @param {string} value The raw value from the backend.
 * @param {string} dataType The XSD dataType from the backend.
 */
function formatDateTimeValue(value: string, dataType: string): string {
  switch (dataType) {
    case XSD_DATETIME:
      return new Date(value).toLocaleString();
    case XSD_DATE:
      return new Date(value).toLocaleDateString();
    case XSD_TIME:
      // Time values like "00:00" or "23:59" are not valid Date strings
      // Return as-is since they're already formatted
      return value;
    default:
      return value;
  }
}

/**
 * Parses the lifecycle field to their translations.
 *
 * @param {string} field Name of field from backend to be translated.
 * @param {Record<string, string>} outputRow The row data being built.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseLifecycleFieldsToTranslations(field: string, outputRow: Record<string, string>, titleDict: Record<string, string>): string {
  const currentVal: string = outputRow[field];
  // Delete unmodified field first before adding the translation
  switch (field.toLowerCase()) {
    case "lastmodified":
      delete outputRow[field];
      outputRow[titleDict.lastModified] = currentVal; // Keep raw ISO date for sorting
      return titleDict.lastModified;
    case "scheduletype":
      delete outputRow[field];
      outputRow[titleDict.scheduleType] = currentVal;
      return titleDict.scheduleType;
    case "status":
      delete outputRow[field];
      outputRow[titleDict.status] = currentVal;
      return titleDict.status;
    default:
      return field;
  }
}

/**
 * Generates the sort parameters required for the API endpoint based on the input sort.
 *
 * @param {SortingState} currentSort The current sorting order.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function genSortParams(currentSort: SortingState, titleDict: Record<string, string>): string {
  let params: string = "";
  if (currentSort.length == 0) {
    return "%2Bid"
  }
  for (const column of currentSort) {
    if (params != "") {
      params += ","
    }
    if (column.desc) {
      params += "-";
    } else {
      params += "%2B";
    }
    const field: string = parseTranslatedFieldToOriginal(column.id, titleDict);
    params += field;
  }
  return params;
}

/**
 * Parses the translated field back to the original name.
 *
 * @param {string} field Name of field for translations
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseTranslatedFieldToOriginal(field: string, titleDict: Record<string, string>): string {
  switch (field.toLowerCase()) {
    case titleDict.lastModified.toLowerCase():
      return "lastModified";
    case titleDict.scheduleType.toLowerCase():
      return "scheduleType";
    case titleDict.status.toLowerCase():
      return "status";
    default:
      return field;
  }
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
