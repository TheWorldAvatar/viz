import { ColumnFilter } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage } from "types/form";
import { parseColumnFiltersIntoUrlParams } from "ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface RowCounts {
  total: number;
  filter: number;
}

/**
* A custom hook to retrieve the total row count.
* 
* @param {string} entityType Type of entity for rendering.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param { ColumnFilter[]} filters The current filters set.
*/
export function useTotalRowCount(
  entityType: string,
  refreshFlag: boolean,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  filters: ColumnFilter[]): RowCounts {
  const dict: Dictionary = useDictionary();
  const [totalRows, setTotalRows] = useState<number>(0);
  const [totalFilteredRows, setTotalFilteredRows] = useState<number>(-1);

  useEffect(() => {
    const fetchTotalRows = async (filterParams: string): Promise<void> => {
      try {
        let url: string;
        if (lifecycleStage == "general") {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
            filterParams ?? "",
          );
        } else if (
          lifecycleStage == "scheduled" ||
          lifecycleStage == "closed") {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
            filterParams ?? "",
            lifecycleStage,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
          );
        } else {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
            filterParams ?? "",
            lifecycleStage,
          );
        }
        const res: AgentResponseBody = await queryInternalApi(url);
        const rows: number = Number.parseInt(res.data?.message);
        if (filterParams == null) {
          setTotalRows(rows);
        } else {
          setTotalFilteredRows(rows);
        }
      } catch (error) {
        console.error("Error fetching total row count", error);
      }
    };
    // Fetch total row counts
    fetchTotalRows(null);
    // Fetch total row counts when filters are applied
    const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);
    fetchTotalRows(filterParams);
  }, [selectedDate, refreshFlag, filters]);
  return {
    total: totalRows,
    filter: totalFilteredRows,
  };
}
