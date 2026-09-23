"use client";

import { TableDescriptor, useTable } from "@/hooks/table/useTable";
import { TableScrollDescriptor, useTableScroll } from "@/hooks/table/useTableScroll";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStageMap } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import ReturnButton from "@/ui/interaction/action/redirect/return-button";
import Button from "@/ui/interaction/button";
import DateInput from "@/ui/interaction/input/date/date-input";
import {
  getNormalizedDate
} from "@/utils/client-utils";
import { DATE_KEY } from "@/utils/constants";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import TableSkeleton from "../skeleton/table-skeleton";
import RegistryTable from "./registry-table";
import ColumnToggle from "../action/column-toggle";

interface RegistryPlannerTableComponentProps {
  entityType: string;
  tableColumnOptions: TableColumnOption[];
}

/**
 * This component renders a registry table for the specified entity to plan the daily tasks.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {TableColumnOption[]} tableColumnOptions Configuration for table column options.
 */
export default function RegistryPlannerTableComponent(
  props: Readonly<RegistryPlannerTableComponentProps>
) {
  const dict: Dictionary = useDictionary();
  const { refreshId, refreshFlag, triggerRefresh } = useOperationStatus();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({ from: selectedDate, to: selectedDate, });

  const tableDescriptor: TableDescriptor = useTable(
    props.entityType,
    refreshId,
    LifecycleStageMap.PLANNER,
    props.tableColumnOptions,
    null,
    selectedDateRange,
  );

  const tableScrollDescriptor: TableScrollDescriptor = useTableScroll();

  useEffect(() => {
    setSelectedDateRange({ from: selectedDate, to: selectedDate, });
    tableDescriptor.table.setColumnFilters([{
      id: DATE_KEY,
      value: {
        isIncluded: true,
        values: [`${getNormalizedDate(selectedDate)}..${getNormalizedDate(selectedDate)}`]
      }
    }])
  }, [tableDescriptor.table, selectedDate]);

  return (
    <div className="bg-muted py-4 px-2 md:py-2.5 md:px-8 flex flex-col md:h-full md:min-h-0">
      <div className="flex justify-end md:justify-between gap-1 py-1 md:py-2">
        <DateInput
          mode="single"
          variant="info_banner"
          ariaLabel={dict.nav.title.tasks}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <div className="flex justify-end items-end gap-1 flex-wrap">
          <ColumnToggle
            columns={tableDescriptor.table.getAllLeafColumns()}
          />
          <Button
            leftIcon={Save}
            aria-label={dict.action.save}
            size="icon"
            onClick={() => {
              tableDescriptor.onSyncTasks();
            }}
            tooltipText={dict.action.save}
            variant="primary"
          />
          <ReturnButton
            leftIcon={ArrowLeft}
            size="icon"
            aria-label={dict.action.return}
            tooltipText={dict.action.return}
            variant="outline"
          />
          <Button
            size="icon"
            leftIcon={RefreshCw}
            variant="outline"
            tooltipText={dict.action.refresh}
            aria-label={dict.action.refresh}
            onClick={triggerRefresh}
          />
        </div>
      </div>

      {refreshFlag || tableDescriptor.isLoading ? (
        <TableSkeleton />
      ) : (
        <RegistryTable
          recordType={props.entityType}
          exports={[]}
          lifecycleStage={LifecycleStageMap.PLANNER}
          disableRowAction={true}
          selectedDate={selectedDateRange}
          tableDescriptor={tableDescriptor}
          triggerRefresh={triggerRefresh}
          accountType={""}
          tableScrollDescriptor={tableScrollDescriptor}
        />
      )}
    </div>
  );
}
