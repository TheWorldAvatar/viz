"use client"

import styles from './registry.table.module.css';

import { Icon } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useDictionary } from 'hooks/useDictionary';
import useRefresh from 'hooks/useRefresh';
import { Paths } from 'io/config/routes';
import { Dictionary } from 'types/dictionary';
import { RegistryFieldValues, RegistryTaskOption } from 'types/form';
import LoadingSpinner from 'ui/graphic/loader/spinner';
import TaskModal from 'ui/interaction/modal/task/task-modal';
import { Status } from 'ui/text/status/status';
import { getAfterDelimiter, parseWordsForLabels } from 'utils/client-utils';
import RegistryTable from './registry-table';
import SummarySection from './ribbon/summary';
import TableRibbon from './ribbon/table-ribbon';

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
export default function RegistryTableComponent(props: Readonly<RegistryTableComponentProps>) {
  const dict: Dictionary = useDictionary();
  const pathNameEnd: string = getAfterDelimiter(usePathname(), "/");
  const [refreshFlag, triggerRefresh] = useRefresh();
  const [initialInstances, setInitialInstances] = useState<RegistryFieldValues[]>([]);
  const [currentInstances, setCurrentInstances] = useState<RegistryFieldValues[]>([]);
  const [task, setTask] = useState<RegistryTaskOption>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        let instances: RegistryFieldValues[] = [];
        if (props.lifecycleStage === Paths.REGISTRY_REPORT) {
          if (pathNameEnd === props.entityType) {
            // Fetch active contracts
            const activeRes = await fetch(
              `/api/registry/lifecycle-data?currentStage=active&entityType=${props.entityType}`,
              { cache: 'no-store', credentials: 'same-origin' }
            );
            let activeInstances = await activeRes.json();
            activeInstances = activeInstances.map((contract: RegistryFieldValues) => ({
              status: {
                value: parseWordsForLabels(Status.ACTIVE),
                type: "literal",
                dataType: "http://www.w3.org/2001/XMLSchema#string",
                lang: "",
              },
              ...contract
            }));

            // Fetch archived contracts
            const archivedRes = await fetch(
              `/api/registry/lifecycle-data?currentStage=archive&entityType=${props.entityType}`,
              { cache: 'no-store', credentials: 'same-origin' }
            );
            const archivedInstances = await archivedRes.json();

            instances = activeInstances.concat(archivedInstances);
          } else {
            // Fetch service tasks for a specific contract
            const params = new URLSearchParams({
              contractType: props.entityType,
              id: pathNameEnd,
            });
            const res = await fetch(`/api/registry/service-tasks?${params.toString()}`, {
              cache: 'no-store',
              credentials: 'same-origin'
            });
            instances = await res.json();
          }
        } else if (props.lifecycleStage == Paths.REGISTRY_TASK_DATE) {
          // Fetch service tasks for a specific date
          const date = new Date(selectedDate);
          const unixTimestamp: number = Math.floor(date.getTime() / 1000);
          const params = new URLSearchParams({
            contractType: props.entityType,
            time: unixTimestamp.toString(),
          });
          const res = await fetch(`/api/registry/service-tasks?${params.toString()}`, {
            cache: 'no-store',
            credentials: 'same-origin'
          });
          instances = await res.json();
        } else if (props.lifecycleStage == Paths.REGISTRY_GENERAL) {
          const res = await fetch(
            `/api/registry/data?entityType=${props.entityType}&requireLabel=true`,
            { cache: 'no-store', credentials: 'same-origin' }
          );
          instances = await res.json();
        } else {
          const res = await fetch(
            `/api/registry/lifecycle-data?currentStage=${props.lifecycleStage}&entityType=${props.entityType}`,
            { cache: 'no-store', credentials: 'same-origin' }
          );
          instances = await res.json();
        }
        setInitialInstances(instances);
        setCurrentInstances(instances);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching instances', error);
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
  }, [task])

  return (
    <div className={styles["container"]}>
      <div className={styles["title"]}>
        <h1>{parseWordsForLabels(props.entityType)}</h1>
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
      {(props.lifecycleStage == Paths.REGISTRY_ACTIVE || props.lifecycleStage == Paths.REGISTRY_ARCHIVE) &&
        <div className={styles["instructions"]}>
          <Icon className={`material-symbols-outlined`}>info</Icon>
          {dict.message.registryInstruction}
        </div>}
      {props.lifecycleStage == Paths.REGISTRY_REPORT &&
        <h2 className={styles["instructions"]}>{dict.title.serviceSummary}<hr /></h2>}
      <div className={styles["contents"]}>
        {props.lifecycleStage == Paths.REGISTRY_REPORT &&
          <SummarySection
            id={pathNameEnd}
            entityType={props.entityType}
          />}
        {refreshFlag || isLoading ? <LoadingSpinner isSmall={false} /> :
          currentInstances.length > 0 ?
            <RegistryTable
              recordType={props.entityType}
              lifecycleStage={props.lifecycleStage}
              setTask={setTask}
              instances={currentInstances}
              limit={3}
            /> : <div className={styles["instructions"]}>{dict.message.noResultFound}</div>}
      </div>
      {task && <TaskModal
        entityType={props.entityType}
        registryAgentApi={props.registryAgentApi}
        isOpen={isTaskModalOpen}
        task={task}
        setIsOpen={setIsTaskModalOpen}
        setTask={setTask}
      />}
    </div>
  );
}