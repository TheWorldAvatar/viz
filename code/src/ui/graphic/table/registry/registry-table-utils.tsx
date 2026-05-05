import {
  ColumnDef,
  ColumnFilter,
  FilterFnOption,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";
import { Routes } from "io/config/routes";
import { DateBefore } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { browserStorageManager } from "state/browser-storage-manager";
import { AgentResponseBody, ColumnDefinitionResponse, InternalApiIdentifierMap } from "types/backend-agent";
import {
  FormTypeMap,
  LifecycleStage,
  LifecycleStageMap,
  RegistryFieldValues,
  RegistryFlatFieldValues,
  SparqlResponseField
} from "types/form";
import { TableColumnOption } from "types/settings";
import ExpandableTextCell from "ui/graphic/table/cell/expandable-text-cell";
import { SelectOptionType } from "ui/interaction/dropdown/simple-selector";
import StatusComponent from "ui/text/status/status";
import { formatDateValue, formatDatetimeValue, getAfterDelimiter, getId, isValidIRI, parseWordsForLabels } from "utils/client-utils";
import { DATE_KEY, EVENT_KEY, FLAG_EMOJI, FLAG_KEY, XSD_DATE, XSD_DATETIME } from "utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";
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
    // For date filters
    if (typeof filter.value == "string") {
      return `%7E${parseTranslatedFieldToOriginal(filter.id, titleDict)}=${filter.value}`;
    }
    const currentFilterValues: string[] = filter.value as string[];
    let filterParams: string[];
    if (currentFilterValues.includes(translatedBlankText)) {
      filterParams = [...currentFilterValues.filter(val => val != translatedBlankText), "null"];
    } else {
      filterParams = currentFilterValues;
    }
    return `%7E${parseTranslatedFieldToOriginal(filter.id, titleDict)}=${filterParams.join("%7C")}`;
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
    const title: string = col.value == FLAG_KEY ? FLAG_EMOJI : parseWordsForLabels(translateLifecycleFields(col.value, titleDict));
    const minWidth: number = col.value == FLAG_KEY ? title.length : Math.max(
      title.length * 15,
      125
    );
    const isDateColumn: boolean = col.datatype === XSD_DATE;
    const isDateTimeColumn: boolean = col.datatype === XSD_DATETIME;

    const configuredWidth: number | undefined = columnOptions?.find((item) => item.name === col.value)?.width;
    const effectiveWidth = configuredWidth ?? minWidth;
    const maxLengthText: number = calculateMaxCharLengthFromWidth(effectiveWidth);

    results.push({
      id: col.value,
      accessorKey: col.value,
      header: title,
      dataType: col.value == FLAG_KEY ? col.value : col.type == "array" ? col.type : col.datatype,
      stage: col.stage,
      cell: ({ getValue }) => {
        if (col.value == FLAG_KEY) {
          if (getValue() == "true") {
            return FLAG_EMOJI;
          }
          return "";
        }
        if (Array.isArray(getValue())) {
          const arrayFields: Record<string, string>[] = getValue() as Record<string, string>[];
          return <ArrayTextCell fields={arrayFields} maxLengthText={maxLengthText} />
        }
        const value: string = getValue() as string;
        if (!value) return "";
        // Format datetime/date columns for display
        if (isDateTimeColumn) {
          return formatDatetimeValue(value);
        }
        if (isDateColumn) {
          return formatDateValue(value);
        }

        if (isValidIRI(value)) {
          return getAfterDelimiter(value, "/");
        }

        // Column header name is untranslated so we can directly compare to a string
        if (col.value === "status") {
          return <StatusComponent status={value} />;
        }

        return (
          <ExpandableTextCell overrideExpansion={columns.length <= 2} text={value} maxLengthText={maxLengthText} />
        );
      },
      filterFn: multiSelectFilter,
      size: effectiveWidth,
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
      item.name,
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
 * Parses the lifecycle field to their translations.
 *
 * @param {string} field Name of field from backend to be translated.
 * @param {Record<string, string>} titleDict The translations for the dict.title path.
 */
export function translateLifecycleFields(field: string, titleDict: Record<string, string>): string {
  switch (field.toLowerCase()) {
    case "date":
      return titleDict.date;
    case "event_id":
      return titleDict.eventId;
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
 * Retrieves the record ID for a given row, prioritizing 'event_id', then 'id', and finally 'iri'.
 *
 * @param {FieldValues} row The row data.
 * @returns {string} The record ID.
 */
export function getRowRecordId(row: FieldValues): string {
  if (row.event_id) {
    return getId(row.event_id);
  }

  if (row.id) {
    return getId(row.id);
  }

  return getId(row.iri);
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
 * Calculates the maximum text length to display in a cell based on column width.
 * Uses tunable width-to-character estimation so truncation can be less aggressive.
 *
 * @param {number} width The column width in pixels.
 * @returns {number} The maximum number of characters to display before truncation.
 */
function calculateMaxCharLengthFromWidth(width: number | undefined): number {
  const DEFAULT_MAX_LENGTH_CHARACTERS = 25;
  const APPROX_CHAR_WIDTH_PX = 8;
  // The expansion factor is a tunable parameter that determines how many characters to show based on the column width.
  // Change this factor based on how aggressive the truncation should be (e.g. 1.5 would be more aggressive, 3 would be less)
  // The higher the factor, the more characters will be shown before truncation, but this runs the risk of breaking the layout if too high and the text is too long
  const EXPANSION_FACTOR = 6;

  if (width === undefined) {
    return DEFAULT_MAX_LENGTH_CHARACTERS;
  }
  const estimatedLength: number = Math.floor((width / APPROX_CHAR_WIDTH_PX) * EXPANSION_FACTOR);
  return Math.max(estimatedLength, DEFAULT_MAX_LENGTH_CHARACTERS);
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

/**
 * Executes the review billable action which checks if the bill is already accrued or not and navigates to the correct drawer.
 *
 * @param {FieldValues} row The row data.
 * @param {string} accountType The account type.
 * @param navigateToDrawer The function to navigate to the drawer.
 */
export async function execReviewBillableAction(
  row: FieldValues,
  accountType: string,
  navigateToDrawer: (...urlParts: string[]) => void,
): Promise<void> {
  const url: string = makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.BILL, FormTypeMap.ASSIGN_PRICE, row.id, row.date);
  const body: AgentResponseBody = await queryInternalApi(url);
  browserStorageManager.set(DATE_KEY, row.date);
  browserStorageManager.set(EVENT_KEY, row.event_id);
  try {
    const res: AgentResponseBody = await queryInternalApi(makeInternalRegistryAPIwithParams(
      InternalApiIdentifierMap.FILTER,
      LifecycleStageMap.ACCOUNT,
      accountType,
      row[accountType]
    ));
    const options: SelectOptionType[] = res.data?.items as SelectOptionType[];
    // Set the account type in browser storage to match the values of the account type in the assign price form
    browserStorageManager.set(accountType, options[0]?.value);
  } catch (error) {
    console.error("Error fetching instances", error);
  }
  if (body.data.message == "true") {
    navigateToDrawer(Routes.REGISTRY_TASK_ACCRUAL, getId(row.event_id))
  } else {
    navigateToDrawer(Routes.BILLING_ACTIVITY_PRICE, getId(row.id));
  }
}

