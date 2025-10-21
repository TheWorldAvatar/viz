"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { TableDescriptor, useTable } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { DateRange } from "react-day-picker";
import { AgentResponseBody } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import {
  LifecycleStage,
  RegistryFieldValues,
  RegistryTaskOption,
} from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import TaskModal from "ui/interaction/modal/task/task-modal";
import { selectDrawerIsOpen } from "state/drawer-component-slice";
import { Status } from "ui/text/status/status";
import {
  getAfterDelimiter,
  getInitialDateFromLifecycleStage,
  getUTCDate,
  parseWordsForLabels,
} from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import RegistryTable from "./registry-table";
import TableRibbon from "./ribbon/table-ribbon";
import { toast } from "ui/interaction/action/toast/toast";
import { SparqlResponseField } from "types/form";

interface RegistryTableComponentProps {
  entityType: string;
  lifecycleStage: LifecycleStage;
}

/**
 * This component renders a registry table for the specified entity.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 */
export default function RegistryTableComponent(
  props: Readonly<RegistryTableComponentProps>
) {
  const dict: Dictionary = useDictionary();
  const pathNameEnd: string = getAfterDelimiter(usePathname(), "/");
  const isTaskModalOpen: boolean = useSelector(selectDrawerIsOpen);
  const { refreshFlag, triggerRefresh } = useOperationStatus();
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [currentInstances, setCurrentInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [task, setTask] = useState<RegistryTaskOption>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState<DateRange>(
    getInitialDateFromLifecycleStage(props.lifecycleStage)
  );

  const tableDescriptor: TableDescriptor = useTable(currentInstances);


  const handleBulkApproval: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const selectedRows = tableDescriptor.table.getSelectedRowModel().rows;

    if (selectedRows.length === 0) {
      return;
    }

    const contractIds: string[] = selectedRows.map(row => {
      const rowData = row.original as RegistryFieldValues;
      let id: string;

      if (rowData.event_id) {
        id = typeof rowData.event_id === 'string' ? rowData.event_id : (rowData.event_id as SparqlResponseField).value;
      } else if (rowData.id) {
        id = typeof rowData.id === 'string' ? rowData.id : (rowData.id as SparqlResponseField).value;
      } else {
        id = typeof rowData.iri === 'string' ? rowData.iri : (rowData.iri as SparqlResponseField).value;
      }
      return id
    });

    try {
      const reqBody = {
        contract: contractIds,
        remarks: `${contractIds.length} contract(s) approved successfully!`,
      };

      const res = await fetch(
        makeInternalRegistryAPIwithParams("event", "service", "commence"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          credentials: "same-origin",
          body: JSON.stringify({ ...reqBody }),
        }
      );

      const responseBody: AgentResponseBody = await res.json();

      toast(
        responseBody?.data?.message || responseBody?.error?.message,
        responseBody?.error ? "error" : "success"
      );

      if (!responseBody?.error) {
        // Clear selection and refresh table
        tableDescriptor.table.resetRowSelection();
        triggerRefresh();
      }
    } catch (error) {
      toast("Failed to approve contracts", "error");
      console.error("Error approving contracts", error);
    }
  };

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        let instances: RegistryFieldValues[] = [];
        if (props.lifecycleStage === "report") {
          if (pathNameEnd === props.entityType) {
            // Fetch active contracts
            const activeRes = await fetch(
              makeInternalRegistryAPIwithParams(
                "contracts",
                "active",
                props.entityType
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
                props.entityType
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
                props.entityType,
                pathNameEnd
              ),
              {
                cache: "no-store",
                credentials: "same-origin",
              }
            );
            const resBody: AgentResponseBody = await res.json();
            instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
          }
        } else if (props.lifecycleStage == "outstanding") {
          const res = await fetch(
            makeInternalRegistryAPIwithParams("outstanding", props.entityType),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else if (
          props.lifecycleStage == "scheduled" ||
          props.lifecycleStage == "closed"
        ) {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              props.lifecycleStage == "scheduled" ? "scheduled" : "closed",
              props.entityType,
              getUTCDate((selectedDate as DateRange).from)
                .getTime()
                .toString(),
              getUTCDate((selectedDate as DateRange).to)
                .getTime()
                .toString()
            ),
            {
              cache: "no-store",
              credentials: "same-origin",
            }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else if (props.lifecycleStage == "general") {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              "instances",
              props.entityType,
              "true"
            ),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        } else {
          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              "contracts",
              props.lifecycleStage.toString(),
              props.entityType
            ),
            { cache: "no-store", credentials: "same-origin" }
          );
          const resBody: AgentResponseBody = await res.json();
          instances = (resBody.data?.items as RegistryFieldValues[]) ?? [];
        }
        setInitialInstances(instances);
        setCurrentInstances(instances);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

    // Trigger fetchData when refreshFlag, or selectedDate (range) changes
    fetchData();
  }, [selectedDate, refreshFlag]);

  useEffect(() => {
    // Trigger refresh when back navigation occurs
    const handleHistoryChange = () => {
      triggerRefresh();
    };
    window.addEventListener("popstate", handleHistoryChange);
    return () => {
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, []);

  return (
    <div className="bg-muted  mx-auto overflow-auto w-full p-4 h-dvh ">
      <div className="rounded-lg md:p-4 ">
        <h1 className="text-2xl md:text-4xl font-bold mb-1 sm:mb-4 ">
          {parseWordsForLabels(props.entityType)}
        </h1>
        <TableRibbon
          path={pathNameEnd}
          entityType={props.entityType}
          selectedDate={selectedDate as DateRange}
          setSelectedDate={setSelectedDate}
          lifecycleStage={props.lifecycleStage}
          instances={initialInstances}
          triggerRefresh={triggerRefresh}
          tableDescriptor={tableDescriptor}
          onBulkApproval={handleBulkApproval}
          selectedRowsCount={tableDescriptor.table.getSelectedRowModel().rows.length}
        />
      </div>
      <div className="flex flex-col overflow-auto gap-y-2 py-4  md:p-4">
        {refreshFlag || isLoading ? (
          <LoadingSpinner isSmall={false} />
        ) : currentInstances.length > 0 ? (
          <RegistryTable
            recordType={props.entityType}
            lifecycleStage={props.lifecycleStage}
            instances={currentInstances}
            setTask={setTask}
            tableDescriptor={tableDescriptor}
            triggerRefresh={triggerRefresh}
          />
        ) : (
          <div className="text-lg  ml-6">{dict.message.noResultFound}</div>
        )}
      </div>
      {isTaskModalOpen && task && (
        <TaskModal
          entityType={props.entityType}
          task={task}
          setTask={setTask}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
}
