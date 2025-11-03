"use client";

import { useTotalRowCount } from "hooks/table/api/useTotalRowCount";
import { TableDescriptor, useTable } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { selectDrawerIsOpen } from "state/drawer-component-slice";
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
import {
  getAfterDelimiter,
  getInitialDateFromLifecycleStage,
  getUTCDate,
  parseWordsForLabels,
} from "utils/client-utils";
import { makeInternalRegistryAPIwithParams } from "utils/internal-api-services";
import RegistryTable from "./registry-table";
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
  const isTaskModalOpen: boolean = useSelector(selectDrawerIsOpen);
  const { refreshFlag, triggerRefresh } = useOperationStatus();
  const [task, setTask] = useState<RegistryTaskOption>(null);

  const [selectedDate, setSelectedDate] = useState<DateRange>(
    getInitialDateFromLifecycleStage(props.lifecycleStage)
  );
  const tableDescriptor: TableDescriptor = useTable(pathNameEnd, props.entityType, refreshFlag, props.lifecycleStage, selectedDate);

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
          instances={tableDescriptor.initialInstances}
          triggerRefresh={triggerRefresh}
          tableDescriptor={tableDescriptor}
        />
      </div>
      <div className="flex flex-col overflow-auto gap-y-2 py-4  md:p-4">
        {refreshFlag || tableDescriptor.isLoading ? (
          <LoadingSpinner isSmall={false} />
        ) : tableDescriptor.data?.length > 0 ? (
          <RegistryTable
            recordType={props.entityType}
            lifecycleStage={props.lifecycleStage}
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
