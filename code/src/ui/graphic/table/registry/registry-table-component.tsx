"use client";

import styles from "./registry.table.module.css";

import { Icon } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useDictionary } from "hooks/useDictionary";
import useRefresh from "hooks/useRefresh";
import { Paths } from "io/config/routes";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues, RegistryTaskOption } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import TaskModal from "ui/interaction/modal/task/task-modal";
import { Status } from "ui/text/status/status";
import { getAfterDelimiter, parseWordsForLabels } from "utils/client-utils";
import {
  getData,
  getLifecycleData,
  getServiceTasks,
} from "utils/server-actions";
import RegistryTable from "./registry-table";
import SummarySection from "./ribbon/summary";
import TableRibbon from "./ribbon/table-ribbon";

interface RegistryTableComponentProps {
  entityType: string;
  lifecycleStage: string;
  registryAgentApi: string;
}

/**
 * This component renders a registry table for the specified entity.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {string} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} registryAgentApi The target endpoint for default registry agents.
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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        let instances: RegistryFieldValues[] = [];
        if (props.lifecycleStage === Paths.REGISTRY_REPORT) {
          // If this is the base report page, users should retrieve all contracts
          if (pathNameEnd === props.entityType) {
            instances = await getLifecycleData(
              props.registryAgentApi,
              Paths.REGISTRY_ACTIVE,
              props.entityType
            );
            instances = instances.map((contract) => {
              return {
                status: {
                  value: parseWordsForLabels(Status.ACTIVE),
                  type: "literal",
                  dataType: "http://www.w3.org/2001/XMLSchema#string",
                  lang: "",
                },
                ...contract,
              };
            });
            const archivedContracts: RegistryFieldValues[] =
              await getLifecycleData(
                props.registryAgentApi,
                Paths.REGISTRY_ARCHIVE,
                props.entityType
              );
            instances = instances.concat(archivedContracts);
          } else {
            // If this is the report page for specific contracts, retrieve tasks associated with the id
            instances = await getServiceTasks(
              props.registryAgentApi,
              props.entityType,
              pathNameEnd
            );
          }
        } else if (props.lifecycleStage == Paths.REGISTRY_TASK_DATE) {
          // Create a Date object from the YYYY-MM-DD string
          const date = new Date(selectedDate);
          // Convert to Unix timestamp in seconds (divide milliseconds by 1000)
          const unixTimestamp: number = Math.floor(date.getTime() / 1000);
          instances = await getServiceTasks(
            props.registryAgentApi,
            props.entityType,
            null,
            unixTimestamp
          );
        } else if (props.lifecycleStage == Paths.REGISTRY_GENERAL) {
          instances = await getData(
            props.registryAgentApi,
            props.entityType,
            null,
            null,
            true
          );
        } else {
          instances = await getLifecycleData(
            props.registryAgentApi,
            props.lifecycleStage,
            props.entityType
          );
        }
        setInitialInstances(instances);
        setCurrentInstances(instances);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

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
    <div className="grow  h-full w-full overflow-auto   mb-20 bg-muted border-border rounded-xl border-1 p-6 shadow-2xl mt-20">
      <div className="">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
          {parseWordsForLabels(props.entityType)}
        </h1>
        <TableRibbon
          path={pathNameEnd}
          entityType={props.entityType}
          registryAgentApi={props.registryAgentApi}
          lifecycleStage={props.lifecycleStage}
          selectedDate={selectedDate}
          instances={initialInstances}
          setCurrentInstances={setCurrentInstances}
          setSelectedDate={setSelectedDate}
          triggerRefresh={triggerRefresh}
        />
      </div>
      <div className="flex items-center my-4">
        {(props.lifecycleStage == Paths.REGISTRY_ACTIVE ||
          props.lifecycleStage == Paths.REGISTRY_ARCHIVE) && (
          <div className="flex items-center gap-2 text-lg">
            <Icon className={`material-symbols-outlined`}>info</Icon>
            {dict.message.registryInstruction}
          </div>
        )}
        {props.lifecycleStage == Paths.REGISTRY_REPORT && (
          <h2 className="text-lg flex-wap">
            {dict.title.serviceSummary}
            <hr />
          </h2>
        )}
      </div>
      <div className={styles["contents"]}>
        {props.lifecycleStage == Paths.REGISTRY_REPORT && (
          <SummarySection
            id={pathNameEnd}
            entityType={props.entityType}
            registryAgentApi={props.registryAgentApi}
          />
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
          <div className="text-lg">{dict.message.noResultFound}</div>
        )}
      </div>
      {task && (
        <TaskModal
          entityType={props.entityType}
          registryAgentApi={props.registryAgentApi}
          isOpen={isTaskModalOpen}
          task={task}
          setIsOpen={setIsTaskModalOpen}
          setTask={setTask}
        />
      )}
    </div>
  );
}
