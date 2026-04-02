import {
  ColumnDef,
  ColumnFilter,
  FilterFnOption,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import { DateBefore } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { ColumnDefinitionResponse } from "types/backend-agent";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryFlatFieldValues,
  SparqlResponseField
} from "types/form";
import { TableColumnOption } from "types/settings";
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";
import StatusComponent from "ui/text/status/status";
import { getAfterDelimiter, isValidIRI, parseWordsForLabels } from "utils/client-utils";
import { XSD_DATETIME } from "utils/constants";
import ArrayTextCell from "../cell/array-text-cell";

export type EnhancedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  dataType: string;
  stage: string;
};

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
 * @param {SortingState} sorting Current sorting state.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseDataForTable(instances: RegistryFieldValues[], sorting: SortingState,
  titleDict: Record<string, string>): FieldValues[] {
  const data: FieldValues[] = [];
  if (instances?.length > 0) {
    instances.forEach(instance => {
      const flatInstance: RegistryFlatFieldValues = flattenInstance(instance, titleDict);
      data.push(flatInstance);
    });
  }
  return data.sort((a: FieldValues, b: FieldValues): number => {
    for (const sort of sorting) {
      const field: string = sort.id;
      const valA: string = a[field];
      const valB: string = b[field];
      // For null, undefined, or empty values, 
      // A comes last if descending, and first if ascending
      if (!valA) return sort.desc ? 1 : -1;
      // B comes first if descending, and last if ascending
      if (!valB) return sort.desc ? -1 : 1;

      const comparison: number = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
      // Only returns the comparison if they are not equal on this sort field
      // A user may have multiple fields to sort, and if they are equal on this field, 
      // we must continue with the other fields to compare
      if (comparison !== 0) {
        return sort.desc ? -comparison : comparison;
      }
    }
    // If all fields are equal, there is no need to reorder
    return 0;
  });
}

/**
 * Flattens the instance to a string instead of SparqlResponseField.
 *
 * @param {RegistryFieldValues} instance The original column definitions.
 * @param {Record<string, string>} titleDict The dictionary object leading to title.
 */
function flattenInstance(
  instance: RegistryFieldValues,
  titleDict: Record<string, string>
): RegistryFlatFieldValues {
  const flatInstance: RegistryFlatFieldValues = {};
  const instanceFields: string[] = Object.keys(instance);

  instanceFields.forEach((instanceField) => {
    const instanceValue: SparqlResponseField | RegistryFieldValues[] = instance[instanceField];
    if (Array.isArray(instanceValue)) {
      // For array fields, only display array field, subfields need not be parsed
      flatInstance[instanceField] = instanceValue.map((nestedFields) =>
        flattenInstance(nestedFields, titleDict)) as Record<string, string>[];
    } else {
      flatInstance[instanceField] = instanceValue?.value;
    }
  });
  return flatInstance;
}

/**
 * Parses the column metadata to include both configured order as well as the column definitions.
 *
 * @param {ColumnDef<FieldValues>[]} columns The original column definitions.
 * @param {TableColumnOption[]} columnOptions Configuration for table column options.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function parseColumnsMetadata(
  columns: ColumnDefinitionResponse[],
  columnOptions: TableColumnOption[],
  titleDict: Record<string, string>,
): EnhancedColumnDef<FieldValues>[] {
  const multiSelectFilter: FilterFnOption<FieldValues> = buildMultiFilterFnOption(titleDict.blank);
  const results: EnhancedColumnDef<FieldValues>[] = [];
  // Create column definitions based on available columns
  for (const col of columns) {
    // Only translate the title, do not translate the accessor key as it is needed for data access and API querying
    const title: string = parseWordsForLabels(translateLifecycleFields(col.value, titleDict));
    const minWidth: number = Math.max(
      title.length * 15,
      125
    );
    const isDateTimeColumn: boolean = col.datatype === XSD_DATETIME;
    results.push({
      accessorKey: col.value,
      header: title,
      dataType: col.type == "array" ? col.type : col.datatype,
      stage: col.stage,
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

        if (col.value === titleDict.status) {
          return <StatusComponent status={value} />;
        }

        return (
          <ExpandableTextCell overrideExpansion={columns.length <= 2} text={value} maxLengthText={25} />
        );
      },
      filterFn: multiSelectFilter,
      size: minWidth,
      enableSorting: true,
      sortDescFirst: true,
      sortingFn: isDateTimeColumn ? "datetime" : undefined,
    });
  }

  // Sort by settings if set in the viz
  if (!columnOptions || columnOptions.length === 0) return results;

  if (columns.length !== columnOptions.length) {
    console.warn("Configured column order does not match the number of columns available.");
  }
  const configuredColumnMap: Map<string, TableColumnOption> = new Map(
    columnOptions.map((item, index) => [
      translateLifecycleFields(item.name, titleDict),
      { ...item, order: index }
    ])
  );

  return results
    .sort((a, b) => {
      const accessorKeyA: string = (a as { accessorKey?: string }).accessorKey;
      const accessorKeyB: string = (b as { accessorKey?: string }).accessorKey;
      const indexA: number = configuredColumnMap.get(accessorKeyA)?.order ?? Infinity; // Use Infinity to ensure any unconfigured columns go to the end
      const indexB: number = configuredColumnMap.get(accessorKeyB)?.order ?? Infinity;
      return indexA - indexB;
    })
    .map((column) => {
      const accessorKey: string = (column as { accessorKey?: string }).accessorKey;
      const configuredWidth: number = configuredColumnMap.get(accessorKey)?.width;
      if (configuredWidth === undefined) {
        return column;
      }
      return {
        ...column,
        size: configuredWidth,
      };
    });
}

/**
 * Builds the initial column visibility state from the column options config.
 * Columns with `visible: false` are hidden; all others default to visible.
 *
 * @param {TableColumnOption[]} columnOptions Configuration for table column options.
 * @param {Record<string, string>} titleDict The dictionary object leading to title.
 */
export function getInitialColumnVisibilityState(
  columnOptions: TableColumnOption[],
  titleDict: Record<string, string>
): VisibilityState {
  if (!columnOptions || columnOptions.length === 0) return {};
  const columnVisibilityState: VisibilityState = {};
  for (const item of columnOptions) {
    if (item.visible === false) {
      columnVisibilityState[translateLifecycleFields(item.name, titleDict)] = false;
    }
  }
  return columnVisibilityState;
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
      return "lastmodified";
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
