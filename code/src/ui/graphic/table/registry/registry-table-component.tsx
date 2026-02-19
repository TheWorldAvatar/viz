"use client";

import { TableDescriptor, useTable } from "hooks/table/useTable";
import { useDictionary } from "hooks/useDictionary";
import useOperationStatus from "hooks/useOperationStatus";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap } from "types/form";
import { TableColumnOrderSettings } from "types/settings";
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
  accountType?: string;
  tableColumnOrder: TableColumnOrderSettings;
}

/**
 * This component renders a registry table for the specified entity.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} accountType Optional value to indicate the type of account for billing capabilities.
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
  const tableDescriptor: TableDescriptor = useTable(
    props.entityType,
    refreshFlag,
    props.lifecycleStage,
    props.tableColumnOrder,
    null,
    selectedDate,
  );

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
    <div className="bg-muted py-4 px-2 md:py-2.5 md:px-8">
      <div className="rounded-lg pb-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-1 sm:mb-4 ">
          {props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
            props.lifecycleStage === LifecycleStageMap.PRICING ||
            props.lifecycleStage === LifecycleStageMap.INVOICE
            ? dict.nav.title.billing
            : parseWordsForLabels(props.entityType)}
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
      {refreshFlag || tableDescriptor.isLoading ? (
        <TableSkeleton />
      ) : tableDescriptor.data?.length > 0 ? (
        <RegistryTable
          recordType={props.entityType}
          lifecycleStage={props.lifecycleStage}
          disableRowAction={false}
          selectedDate={selectedDate}
          tableDescriptor={tableDescriptor}
          triggerRefresh={triggerRefresh}
          accountType={props.accountType}
        />
      ) : (
        <div className="text-lg ml-6">{dict.message.noResultFound}</div>
      )}
    </div>
  );
}
