import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { LifecycleStage } from "types/form";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

/**
* A custom hook to retrieve the total row count.
* 
* @param {string} entityType Type of entity for rendering.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
*/
export function useTotalRowCount(entityType: string, refreshFlag: boolean, lifecycleStage: LifecycleStage, selectedDate: DateRange): number {
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => {
    const fetchTotalRows = async (): Promise<void> => {
      try {
        let url: string;
        if (lifecycleStage == "general") {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
          );
        } else if (
          lifecycleStage == "scheduled" ||
          lifecycleStage == "closed") {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
            lifecycleStage,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
          );
        } else {
          url = makeInternalRegistryAPIwithParams(
            "count",
            entityType,
            lifecycleStage,
          );
        }
        const res = await fetch(
          url,
          { cache: "no-store", credentials: "same-origin" }
        );
        const resBody: AgentResponseBody = await res.json();
        const totalRows: number = Number.parseInt(resBody.data?.message);
        setTotalRows(totalRows);
      } catch (error) {
        console.error("Error fetching total row count", error);
      }
    };
    fetchTotalRows();
  }, [selectedDate, refreshFlag]);

  return totalRows;
}
