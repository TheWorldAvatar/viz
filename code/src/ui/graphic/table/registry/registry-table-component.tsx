"use client";

import { TableDescriptor, useTable } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Dictionary } from "types/dictionary";
import { LifecycleStage } from "types/form";
import {
  getAfterDelimiter,
  getInitialDateFromLifecycleStage,
  parseWordsForLabels
} from "utils/client-utils";
import TableSkeleton from "../skeleton/table-skeleton";
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
  const { refreshFlag, triggerRefresh } = useOperationStatus();

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
    <div className="bg-muted mx-auto overflow-auto w-full p-2.5 sm:p-4 h-dvh">
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
          <TableSkeleton />
        ) : tableDescriptor.data?.length > 0 ? (
          <RegistryTable
            recordType={props.entityType}
            lifecycleStage={props.lifecycleStage}
            selectedDate={selectedDate}
            tableDescriptor={tableDescriptor}
            triggerRefresh={triggerRefresh}
          />
        ) : (
          <div className="text-lg ml-6">{dict.message.noResultFound}</div>
        )}
      </div>
    </div>
  );
}
