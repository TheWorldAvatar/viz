import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { TableDescriptor } from "hooks/table/useTable";
import { DragAndDropDescriptor, useTableDnd } from "hooks/table/useTableDnd";
import { useDictionary } from "hooks/useDictionary";

import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import { FormTypeMap, LifecycleStage, LifecycleStageMap } from "types/form";
import HeaderCell from "../cell/header-cell";
import TablePagination from "../pagination/table-pagination";
import HeaderRow from "../row/header-row";
import TableRow from "../row/table-row";
import { EnhancedColumnDef, getRowRecordId } from "./registry-table-utils";

interface RegistryTableProps {
  recordType: string;
  accountType: string;
  disableRowAction: boolean;
  lifecycleStage: LifecycleStage;
  tableDescriptor: TableDescriptor;
  triggerRefresh: () => void;
  selectedDate?: DateRange;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {boolean} disableRowAction Hides the row actions for the user if true.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param triggerRefresh A function to refresh the table when required.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor.table,
    props.tableDescriptor.data,
    props.tableDescriptor.setData
  );

  if (props.tableDescriptor.table.getVisibleLeafColumns().length > 0) {
    return (
      <div className="rounded-lg border border-border w-full mr-auto overflow-hidden fade-in-on-motion flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-auto table-scrollbar">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={dragAndDropDescriptor.handleDragEnd}
            sensors={dragAndDropDescriptor.sensors}
          >
            <table
              aria-label={`${props.recordType} registry table`}
              className="border-separate border-spacing-0 w-full"
            >
              <thead className="bg-muted sticky top-0 z-10">
                {props.tableDescriptor.table
                  .getHeaderGroups()
                  .map((headerGroup) => (
                    <HeaderRow
                      key={headerGroup.id}
                      triggerRefresh={props.triggerRefresh}
                    >
                      {headerGroup.headers.map((header, index) => {
                        const colDef: EnhancedColumnDef<FieldValues> = header.column.columnDef as EnhancedColumnDef<FieldValues>;
                        return (
                          <HeaderCell
                            key={header.id + index}
                            type={props.recordType}
                            table={props.tableDescriptor.table}
                            header={header}
                            lifecycleStage={props.lifecycleStage}
                            selectedDate={props.selectedDate}
                            filters={props.tableDescriptor.filters}
                            isEditable={props.tableDescriptor.isBulkDispatchEdit && colDef.stage === FormTypeMap.DISPATCH}
                            disableSort={colDef.dataType == "array"}
                            disableFilter={colDef.dataType == "array" ||
                              (props.lifecycleStage == LifecycleStageMap.BILLABLE && header.id == props.accountType)}
                          />
                        );
                      })}
                    </HeaderRow>
                  ))}
              </thead>
              <tbody>
                {props.tableDescriptor.table.getRowModel().rows?.length > 0 && (
                  <SortableContext
                    items={dragAndDropDescriptor.dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {props.tableDescriptor.table.getRowModel().rows.map(row => {
                      const recordId: string = getRowRecordId(row.original as FieldValues);
                      return <TableRow
                        key={recordId}
                        id={recordId}
                        row={row}
                        accountType={props.accountType}
                        disableRowAction={props.disableRowAction}
                        triggerRefresh={props.triggerRefresh}
                      />
                    })}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
        <TablePagination rows={props.tableDescriptor.totalRows} table={props.tableDescriptor.table} pagination={props.tableDescriptor.pagination} />
      </div>
    );
  }
  return (
    <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
      {dict.message.noVisibleColumns}
    </div>
  );
}
