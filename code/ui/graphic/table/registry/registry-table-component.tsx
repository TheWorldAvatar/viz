"use client";

import { TableDescriptor, useTable } from "@/hooks/table/useTable";
import { useTableScroll } from "@/hooks/table/useTableScroll";
import { useDictionary } from "@/hooks/useDictionary";
import useOperationStatus from "@/hooks/useOperationStatus";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDispatch, useSelector } from "react-redux";
import { addItem, selectItem } from "@/state/context-menu-slice";
import { Dictionary, LanguageDictionary } from "@/types/dictionary";
import { LifecycleStage, LifecycleStageMap } from "@/types/form";
import { ContextItemMap, TableColumnOption } from "@/types/settings";
import { ContextItemDefinition } from "@/ui/interaction/context-menu/context-item";
import {
  getAfterDelimiter,
  getInitialDateFromLifecycleStage,
  parseWordsForLabels
} from "@/utils/client-utils";
import TableSkeleton from "../skeleton/table-skeleton";
import RegistryTable from "./registry-table";
import TableRibbon from "./ribbon/table-ribbon";



interface RegistryTableComponentProps {
  entityType: string;
  lifecycleStage: LifecycleStage;
  accountType?: string;
  message?: LanguageDictionary;
  tableColumnOptions: TableColumnOption[];
}

/**
 * This component renders a registry table for the specified entity.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} accountType Optional value to indicate the type of account for billing capabilities.
 * @param {LanguageDictionary} message Optional value to display a user-defined message at the table ribbon.
 * @param {TableColumnOption[]} tableColumnOptions Configuration for table column options.
 */
export default function RegistryTableComponent(
  props: Readonly<RegistryTableComponentProps>
) {
  const dict: Dictionary = useDictionary();
  const dispatch = useDispatch();
  const pathNameEnd: string = getAfterDelimiter(usePathname(), "/");
  const { refreshId, refreshFlag, triggerRefresh } = useOperationStatus();

  const filterOption: TableColumnOption = props.tableColumnOptions?.find(option => option.name === "filter");
  const disableDateFilter: boolean = filterOption ? !filterOption.visible : false;

  const [selectedDate, setSelectedDate] = useState<DateRange>(
    getInitialDateFromLifecycleStage(props.lifecycleStage, disableDateFilter)
  );

  const tableRibbonContextItem: ContextItemDefinition = useMemo(() => {
    return {
      name: dict.context.tableRibbon.title,
      description: dict.context.tableRibbon.tooltip,
      id: ContextItemMap.TABLE_RIBBON,
      toggled: true,
    };
  }, [dict]);

  const ribbonState: ContextItemDefinition = useSelector(selectItem(tableRibbonContextItem.id));

  const tableDescriptor: TableDescriptor = useTable(
    props.entityType,
    refreshId,
    props.lifecycleStage,
    props.tableColumnOptions,
    null,
    selectedDate,
  );

  const { scrollPositionRef, scrollContainerRef } = useTableScroll(tableDescriptor, selectedDate);

  const triggerTableRefresh = () => {
    triggerRefresh();
    tableDescriptor.table.resetRowSelection();
  }

  useEffect(() => {
    dispatch(addItem(tableRibbonContextItem));
  }, [dispatch, tableRibbonContextItem]);

  useEffect(() => {
    // Trigger refresh when back navigation occurs
    const handleHistoryChange = () => {
      triggerTableRefresh();
    };
    window.addEventListener("popstate", handleHistoryChange);
    return () => {
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, []);

  return (
    <div className="bg-muted py-4 px-2 md:py-2.5 md:px-8 flex flex-col md:h-full md:min-h-0">
      <div className="rounded-lg pb-4">
        <h1 className="py-1 md:py-4 text-2xl md:text-4xl font-bold">
          {props.lifecycleStage === LifecycleStageMap.ACCOUNT ||
            props.lifecycleStage === LifecycleStageMap.PRICING ||
            props.lifecycleStage === LifecycleStageMap.INVOICE
            ? dict.nav.title.billing
            : parseWordsForLabels(props.entityType)}
        </h1>

        {ribbonState?.toggled &&
          <TableRibbon
            path={pathNameEnd}
            entityType={props.entityType}
            disableDateFilter={disableDateFilter}
            selectedDate={selectedDate as DateRange}
            setSelectedDate={setSelectedDate}
            lifecycleStage={props.lifecycleStage}
            instances={tableDescriptor.initialInstances}
            triggerRefresh={triggerTableRefresh}
            tableDescriptor={tableDescriptor}
            message={dict.translate(props.message)}
          />}
      </div>
      {refreshFlag || tableDescriptor.isLoading ? (
        <TableSkeleton />
      ) : (
        <RegistryTable
          recordType={props.entityType}
          lifecycleStage={props.lifecycleStage}
          disableRowAction={false}
          selectedDate={selectedDate}
          tableDescriptor={tableDescriptor}
          triggerRefresh={triggerTableRefresh}
          accountType={props.accountType}
          scrollPositionRef={scrollPositionRef}
          scrollContainerRef={scrollContainerRef}
        />
      )}
    </div>
  );
}
