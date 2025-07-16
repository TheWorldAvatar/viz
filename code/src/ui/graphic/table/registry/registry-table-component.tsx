"use client";

import { Icon } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
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
import { Status } from "ui/text/status/status";
import { getAfterDelimiter, getInitialDateFromLifecycleStage, parseWordsForLabels } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import RegistryTable from "./registry-table";
import SummarySection from "./ribbon/summary";
import TableRibbon from "./ribbon/table-ribbon";

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
  const [refreshFlag, triggerRefresh] = useRefresh();
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [currentInstances, setCurrentInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [task, setTask] = useState<RegistryTaskOption>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState<DateRange>(getInitialDateFromLifecycleStage(props.lifecycleStage));

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
        } else if (props.lifecycleStage == "scheduled" || props.lifecycleStage == "closed") {
          const startDate: string = selectedDate.from.toISOString().split("T")[0];
          const endDate: string = selectedDate.to.toISOString().split("T")[0];

          const res = await fetch(
            makeInternalRegistryAPIwithParams(
              props.lifecycleStage == "scheduled" ? "scheduled" : "closed",
              props.entityType,
              startDate,
              endDate
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

    // Trigger fetchData when isTaskModalOpen, refreshFlag, or selectedDate (range) changes
    if (!isTaskModalOpen || refreshFlag) {
      fetchData();
    }
  }, [isTaskModalOpen, selectedDate, refreshFlag]);

  useEffect(() => {
    if (task) {
      setIsTaskModalOpen(true);
    }
  }, [task]);

  return (
    <div className="bg-muted border-border   rounded-xl border-1  shadow-2xl mx-auto mt-4 overflow-auto h-[81vh] w-[95vw]  p-2 sm:w-2xl md:h-[80vh] md:w-[95vw] lg:h-[85vh] lg:w-[95vw] lg:p-4  xl:h-10/12 xl:w-[70vw] 2xl:h-[85vh] ">
      <div className="rounded-lg md:p-4 ">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 ">
          {parseWordsForLabels(props.entityType)}
        </h1>
        <TableRibbon
          path={pathNameEnd}
          entityType={props.entityType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          lifecycleStage={props.lifecycleStage}
          instances={initialInstances}
          setCurrentInstances={setCurrentInstances}
          triggerRefresh={triggerRefresh}
        />
      </div>
      <div className="flex items-center ml-6">
        {(props.lifecycleStage == "scheduled" ||
          props.lifecycleStage == "outstanding" ||
          props.lifecycleStage == "closed") && (
            <div className="flex items-center gap-2   text-sm md:text-md text-foreground ">
              <Icon className={`material-symbols-outlined`}>info</Icon>
              {dict.message.registryInstruction}
            </div>
          )}
        {props.lifecycleStage == "report" && (
          <h2 className="text-md md:text-lg t  flex-wrap">
            {dict.title.serviceSummary}
            <hr />
          </h2>
        )}
      </div>
      <div className="flex flex-col overflow-auto gap-y-2 p-4">
        {props.lifecycleStage == "report" && (
          <SummarySection id={pathNameEnd} entityType={props.entityType} />
        )}
        {refreshFlag || isLoading ? (
          <LoadingSpinner isSmall={false} />
        ) : currentInstances.length > 0 ? (
          <RegistryTable
            recordType={props.entityType}
            lifecycleStage={props.lifecycleStage}
            setTask={setTask}
            instances={currentInstances}
            limit={3}
          />
        ) : (
          <div className="text-lg ml-6">{dict.message.noResultFound}</div>
        )}
      </div>
      {task && (
        <TaskModal
          entityType={props.entityType}
          isOpen={isTaskModalOpen}
          task={task}
          setIsOpen={setIsTaskModalOpen}
          setTask={setTask}
        />
      )}
    </div>
  );
}
