import { TableDescriptor } from "@/hooks/table/useTable";
import { DragAndDropDescriptor, useTableDnd } from "@/hooks/table/useTableDnd";
import { useDictionary } from "@/hooks/useDictionary";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { TableScrollDescriptor } from "@/hooks/table/useTableScroll";
import { Dictionary } from "@/types/dictionary";
import { FORM_IDENTIFIER, FormTemplateType, FormTypeMap, LifecycleStage } from "@/types/form";
import Button from "@/ui/interaction/button";
import { TableSessionContextProvider } from "@/utils/table/TableSessionContext";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import TablePagination from "../pagination/table-pagination";
import HeaderRow from "../row/header-row";
import TableRow, { TableRowHandle } from "../row/table-row";
import { getRowRecordId } from "./registry-table-utils";
import { queryInternalTaskFormTemplate } from "@/utils/internal-api-services";
import { parsePropertyShapeOrGroupList } from "@/ui/interaction/form/form-utils";
import { dexieFormRepo } from "@/utils/db/dexie-form-repository";
import { useConnected } from "@/hooks/useConnected";

interface RegistryTableProps {
  recordType: string;
  accountType: string;
  disableRowAction: boolean;
  lifecycleStage: LifecycleStage;
  tableDescriptor: TableDescriptor;
  triggerRefresh: () => void;
  pricingType?: string;
  selectedDate?: DateRange;
  tableScrollDescriptor: TableScrollDescriptor
  addEntity?: string;
}

/**
 * This component renders a registry of table based on the inputs using TanStack Table.
 *
 * @param {string} recordType The type of the record.
 * @param {string} accountType The type of account for billing capabilities.
 * @param {boolean} disableRowAction Hides the row actions for the user if true.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {string} pricingType Optional value to indicate the type of pricing for billing capabilities.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {TableDescriptor} tableDescriptor A descriptor containing the required table functionalities and data.
 * @param triggerRefresh A function to refresh the table when required.
 * @param {TableScrollDescriptor} tableScrollDescriptor A descriptor containing the required table scroll functionalities.
 * @param {string} addEntity Optional entity type that can be added from each row of the current record type.
 */
export default function RegistryTable(props: Readonly<RegistryTableProps>) {
  const dict: Dictionary = useDictionary();
  const { scrollContainerRef, saveScrollPosition, restoreScrollPosition, scrollToTop } = props.tableScrollDescriptor;
  const rowRefs: RefObject<TableRowHandle[]> = useRef<TableRowHandle[]>([]);
  const dragAndDropDescriptor: DragAndDropDescriptor = useTableDnd(
    props.tableDescriptor,
    rowRefs,
  );

  const isConnected: boolean = useConnected();

  // Restore the persisted scroll position when the table (re)mounts.
  useLayoutEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  useEffect(() => {
    // Fetch a clean form template and parse to get the sync fields required
    const syncBulkEditFields = async (): Promise<void> => {
      try {
        const template: FormTemplateType = await queryInternalTaskFormTemplate(FormTypeMap.DISPATCH, FORM_IDENTIFIER);
        const initialState: FieldValues = { lockField: [] };
        parsePropertyShapeOrGroupList(initialState, FormTypeMap.MASS_EDIT, template?.property, {});
        await dexieFormRepo.sync(isConnected);
        delete initialState.lockField;
      } catch (error) {
        console.error("Failed to fetch form template:", error);
      }
    };

    if (props.tableDescriptor.isBulkDispatchEdit) {
      syncBulkEditFields();
    }
  }, [props.tableDescriptor.isBulkDispatchEdit]);

  // When no column metadata is available at all (e.g. an empty result on first load),
  // the header cannot be rendered, so fall back to a plain "no results" message.
  if (props.tableDescriptor.table.getAllLeafColumns().length === 0) {
    return (
      <div className="text-lg ml-6">
        {dict.message.noResultFound}
      </div>
    );
  }

  if (props.tableDescriptor.table.getVisibleLeafColumns().length > 0) {
    return (
      <TableSessionContextProvider
        recordType={props.recordType}
        lifecycleStage={props.lifecycleStage}
        tableDescriptor={props.tableDescriptor}
        tableScrollDescriptor={props.tableScrollDescriptor}
        rowRefs={rowRefs}
        addEntity={props.addEntity}
        pricingType={props.pricingType}
      >
        <div className="relative rounded-lg border border-border w-full mr-auto overflow-hidden fade-in-on-motion flex flex-col h-[calc(100dvh-13rem)] md:h-full md:min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={(e) => saveScrollPosition(e.currentTarget.scrollTop)}
            className="flex-1 min-h-0 overflow-auto table-scrollbar"
          >
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
                        accountType={props.accountType}
                        headers={headerGroup.headers}
                        triggerRefresh={props.triggerRefresh}
                        selectedDate={props.selectedDate}
                      />
                    ))}
                </thead>
                <tbody>
                  {props.tableDescriptor.table.getRowModel().rows?.length > 0 ? (
                    <SortableContext
                      items={dragAndDropDescriptor.dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {props.tableDescriptor.table.getRowModel().rows.map((row, index) => {
                        const recordId: string = getRowRecordId(row.original as FieldValues);
                        return <TableRow
                          key={recordId}
                          ref={el => { rowRefs.current[index] = el }}
                          id={recordId}
                          row={row}
                          accountType={props.accountType}
                          disableRowAction={props.disableRowAction}
                          triggerRefresh={props.triggerRefresh}
                        />
                      })}
                    </SortableContext>
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="p-8 text-md md:text-lg text-foreground"
                      >
                        {dict.message.noResultFound}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
          <div className="absolute bottom-16 right-6 z-20">
            <Button
              size="icon"
              variant="secondary"
              leftIcon="arrow_upward"
              tooltipText={dict.action.backToTop}
              aria-label={dict.action.backToTop}
              onClick={() => scrollToTop(true)}
              className="rounded-full! shadow-xs border border-border p-5.5"
            />
          </div>
          <TablePagination />
        </div>
      </TableSessionContextProvider >
    );
  }
  return (
    <div className="text-center text-md md:text-lg py-8 text-foreground h-72">
      {dict.message.noVisibleColumns}
    </div>
  );
}
