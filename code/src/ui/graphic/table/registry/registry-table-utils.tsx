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
  RegistryFlatFieldValues,
  SparqlResponseField
} from "types/form";
import { TableColumnOrderSettings } from "types/settings";
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";
import StatusComponent from "ui/text/status/status";
import { getAfterDelimiter, isValidIRI, parseWordsForLabels } from "utils/client-utils";
import { XSD_DATETIME } from "utils/constants";
import ArrayTextCell from "../cell/array-text-cell";

export type EnhancedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & { dataType: string };
export type TableData = {
  data: FieldValues[];
  columns: EnhancedColumnDef<FieldValues>[];
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
    const columnDataTypes: Record<string, string> = {};

    instances.forEach(instance => {
      const flatInstance: RegistryFlatFieldValues = flattenInstance(instance, columnNames, columnDataTypes, titleDict);
      results.data.push(flatInstance);
    });

    // Create column definitions based on available columns
    for (const col of columnNames) {
      const title: string = parseWordsForLabels(col);
      const minWidth: number = Math.max(
        title.length * 15,
        125
      );
      const dataType: string = columnDataTypes[col];
      const isDateTimeColumn: boolean = dataType === XSD_DATETIME;
      results.columns.push({
        accessorKey: col,
        header: title,
        dataType,
        cell: ({ getValue }) => {
          if (Array.isArray(getValue())) {
            const arrayFields: Record<string, string>[] = getValue() as Record<string, string>[];
            return <ArrayTextCell fields={arrayFields} />
          }
          const value: string = getValue() as string;
          if (!value) return "";
          // Format datetime/date columns for display
          if (isDateTimeColumn) {
            return formatDatetimeValue(value);
          }

          if (isValidIRI(value)) {
            return getAfterDelimiter(value, "/");
          }

          if (col === titleDict.status) {
            return <StatusComponent status={value} />;
          }

          return (
            <ExpandableTextCell overrideExpansion={results.columns.length <= 2} text={value} maxLengthText={25} />
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
 * Flattens the instance to a string instead of SparqlResponseField.
 *
 * @param {RegistryFieldValues} instance The original column definitions.
 * @param {string[]}columnNames List of column names.
 * @param {Record<string, string>} columnDataTypes Stores the data type for columns.
 * @param {Record<string, string>} titleDict The dictionary object leading to title.
 */
function flattenInstance(
  instance: RegistryFieldValues,
  columnNames: string[],
  columnDataTypes: Record<string, string>,
  titleDict: Record<string, string>
): RegistryFlatFieldValues {
  const flatInstance: RegistryFlatFieldValues = {};
  const instanceFields: string[] = Object.keys(instance);

  instanceFields.forEach((instanceField, index) => {
    const instanceValue: SparqlResponseField | RegistryFieldValues[] = instance[instanceField];
    let fieldName: string;
    if (Array.isArray(instanceValue)) {
      // For array fields, only display array field, subfields need not be parsed
      flatInstance[instanceField] = instanceValue.map((nestedFields) =>
        flattenInstance(nestedFields, [], {}, titleDict)) as Record<string, string>[];
      fieldName = instanceField;
      columnDataTypes[fieldName] = "array";
    } else {
      flatInstance[instanceField] = instanceValue?.value;
      // Normalise fields with translations so that columns are ordered by translated headers
      fieldName = parseLifecycleFieldsToTranslations(instanceField, flatInstance, titleDict);
      // Store the dataType using the normalized field name only if not already stored
      if (instanceValue?.dataType && !columnDataTypes[fieldName]) {
        columnDataTypes[fieldName] = instanceValue.dataType;
      }
    }
    // Stores column name so that they may be displayed
    if (!columnNames.includes(fieldName)) {
      // Insert at the current index if possible, else push to end
      const insertIndex: number = Math.min(index, columnNames.length);
      columnNames.splice(insertIndex, 0, fieldName);
    }
  });
  return flatInstance;
}

/**
 * Applies the configured column order to the given columns.
 *
 * @param {ColumnDef<FieldValues>[]} columns The original column definitions.
 * @param {TableColumnOrderSettings} config Configuration for table column order.
 * @param {string} entityType Type of entity for rendering.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function applyConfiguredColumnOrder(
  columns: EnhancedColumnDef<FieldValues>[],
  config: TableColumnOrderSettings,
  entityType: string,
  lifecycleStage: LifecycleStage,
  titleDict: Record<string, string>,
): EnhancedColumnDef<FieldValues>[] {
  const configuredOrder: string[] = config[entityType] || config[lifecycleStage];
  if (!configuredOrder || configuredOrder.length === 0) return columns;

  if (columns.length !== configuredOrder.length) {
    console.warn("Configured column order does not match the number of columns available.");
  }

  const orderMap: Map<string, number> = new Map(configuredOrder.map((id, index) => [translateLifecycleFields(id, titleDict), index]));

  return columns.sort((a, b) => {
    const accessorKeyA: string = (a as { accessorKey?: string }).accessorKey;
    const accessorKeyB: string = (b as { accessorKey?: string }).accessorKey;
    const indexA: number = orderMap.get(accessorKeyA) ?? Infinity; // Use Infinity to ensure any unconfigured columns go to the end
    const indexB: number = orderMap.get(accessorKeyB) ?? Infinity;
    return indexA - indexB;
  });
}

/**
 * Formats a datetime value for display.
 *
 * @param {string} value The raw value from the backend.
 */
export function formatDatetimeValue(value: string): string {
  return new Date(value).toLocaleString();
}

/**
 * Parses the lifecycle field to their translations.
 *
 * @param {string} field Name of field from backend to be translated.
 * @param {RegistryFlatFieldValues} outputRow The row data being built.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseLifecycleFieldsToTranslations(field: string, outputRow: RegistryFlatFieldValues, titleDict: Record<string, string>): string {
  // Delete unmodified field after adding the translation
  switch (field.toLowerCase()) {
    case "lastmodified":
      outputRow[titleDict.lastModified] = outputRow[field] as string; // Keep raw ISO date for sorting
      delete outputRow[field];
      return titleDict.lastModified;
    case "scheduletype":
      outputRow[titleDict.scheduleType] = outputRow[field] as string;
      delete outputRow[field];
      return titleDict.scheduleType;
    case "status":
      // Status in english is equivalent and will cause errors
      if (field != titleDict.status) {
        outputRow[titleDict.status] = outputRow[field] as string;
        delete outputRow[field];
      }
      return titleDict.status;
    default:
      return field;
  }
}

/**
 * Parses the lifecycle field to their translations.
 *
 * @param {string} field Name of field from backend to be translated.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function translateLifecycleFields(field: string, titleDict: Record<string, string>): string {
  switch (field.toLowerCase()) {
    case "lastmodified":
      return titleDict.lastModified;
    case "scheduletype":
      return titleDict.scheduleType;
    case "status":
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
