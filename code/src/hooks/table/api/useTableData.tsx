import { PaginationState } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { parseDataForTable, TableData } from "ui/graphic/table/registry/registry-table-utils";
import { Status } from "ui/text/status/status";
import { getUTCDate, parseWordsForLabels } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";

export interface TableDataDescriptor {
  isLoading: boolean;
  tableData: TableData;
  initialInstances: RegistryFieldValues[];
}

/**
* A custom hook to retrieve the total row count.
* 
* @param {string} pathNameEnd End of the current path name.
* @param {string} entityType Type of entity for rendering.
* @param {string} sortParams List of parameters for sorting.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {PaginationState} apiPagination The pagination state for API query.
*/
export function useTableData(
  pathNameEnd: string,
  entityType: string,
  sortParams: string,
  refreshFlag: boolean,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  apiPagination: PaginationState): TableDataDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [data, setData] = useState<
    TableData
  >(null);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        let instances: RegistryFieldValues[] = [];
        if (lifecycleStage === "report") {
          if (pathNameEnd === entityType) {
            // Fetch active contracts
            const activeRes = await fetch(
              makeInternalRegistryAPIwithParams(
                "contracts",
                "active",
                entityType,
                apiPagination.pageIndex.toString(),
                apiPagination.pageSize.toString(),
                sortParams,
              ),
              { cache: "no-store", credentials: "same-origin" }
            );
            const activeResBody: AgentResponseBody = await activeRes.json();
            let activeInstances =
              (activeResBody.data.items as RegistryFieldValues[]) ?? [];
            activeInstances = activeInstances.map(
              (contract: RegistryFieldValues) => ({
                status: {
                  value: parseWordsForLabels(Status.ACTIVE),
                  type: "literal",
                  dataType: "http://www.w3.org/2001/XMLSchema#string",
                  lang: "",
                },
                ...contract,
              })
            );

            // Fetch archived contracts
            const archivedRes = await fetch(
              makeInternalRegistryAPIwithParams(
                "contracts",
                "archive",
                entityType,
                apiPagination.pageIndex.toString(),
                apiPagination.pageSize.toString(),
                sortParams,
              ),
              { cache: "no-store", credentials: "same-origin" }
            );
            const archivedResponseBody: AgentResponseBody =
              await archivedRes.json();
            const archivedInstances: RegistryFieldValues[] =
              (archivedResponseBody.data.items as RegistryFieldValues[]) ?? [];
            instances = activeInstances.concat(archivedInstances);
          } else {
            // Fetch service tasks for a specific contract
            const res = await fetch(
              makeInternalRegistryAPIwithParams(
                "tasks",
                entityType,
                pathNameEnd,
                apiPagination.pageIndex.toString(),
                apiPagination.pageSize.toString(),
                sortParams,
              ),
              {
                cache: "no-store",
                credentials: "same-origin",
              }
            );
            const resBody: AgentResponseBody = await res.json();
            instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
          }
        } else if (lifecycleStage == "outstanding") {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              "outstanding",
              entityType,
              apiPagination.pageIndex.toString(),
              apiPagination.pageSize.toString(),
              sortParams,
            ),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else if (
          lifecycleStage == "scheduled" ||
          lifecycleStage == "closed"
        ) {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              lifecycleStage == "scheduled" ? "scheduled" : "closed",
              entityType,
              getUTCDate(selectedDate.from).getTime().toString(),
              getUTCDate(selectedDate.to).getTime().toString(),
              apiPagination.pageIndex.toString(),
              apiPagination.pageSize.toString(),
              sortParams,
            ),
            {
              cache: "no-store",
              credentials: "same-origin",
            }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else if (lifecycleStage == "general") {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              "instances",
              entityType,
              "true",
              null,
              null,
              apiPagination.pageIndex.toString(),
              apiPagination.pageSize.toString(),
              sortParams,
            ),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              "contracts",
              lifecycleStage.toString(),
              entityType,
              apiPagination.pageIndex.toString(),
              apiPagination.pageSize.toString(),
              sortParams,
            ),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        }
        setInitialInstances(instances);
        setData(parseDataForTable(instances, dict.title));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

    // Trigger fetchData when refreshFlag, or selectedDate (range) changes
    fetchData();
  }, [selectedDate, refreshFlag, apiPagination, sortParams]);

  return {
    isLoading,
    tableData: data,
    initialInstances,
  };
}
