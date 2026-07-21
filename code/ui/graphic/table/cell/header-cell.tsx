import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { Icon } from "@mui/material";
import { ColumnFilter, flexRender, Header, Table } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form";

import { LifecycleStage } from "@/types/form";
import { TableCellTagMap } from "@/types/table";
import RegistryFilter from "@/ui/container/registry-filter";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import Tooltip from "@/ui/interaction/tooltip/tooltip";
import { interpolate } from "@/utils/client-utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { EnhancedColumnDef } from "../registry/registry-table-utils";
import TableCell from "./table-cell";

interface HeaderCellProps {
  type: string;
  table: Table<FieldValues>;
  header: Header<FieldValues, unknown>;
  lifecycleStage: LifecycleStage;
  selectedDate: DateRange;
  isEditable: boolean;
  disableFilter: boolean;
  disableSort: boolean;
  filters: ColumnFilter[];
}

/**
 * This component renders a header cell for the table.
 *
 * @param {string} type The entity type to query for.
 * @param {Table<FieldValues>} table Tanstack table object.
 * @param { Header<FieldValues, unknown>} header The header object in Tanstack for further interactions.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {DateRange} selectedDate The currently selected date.
 * @param {boolean} isEditable Determines if the cell is editable.
 * @param {boolean} disableFilter Disables the filters when set to true.
 * @param {boolean} disableSort Disables sorting when set to true.
 * @param {ColumnFilter[]} filters Filter state for the entire table.
 */
export default function HeaderCell(props: Readonly<HeaderCellProps>) {
  const dict: Dictionary = useDictionary();
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const isActiveFilter: boolean = props.header.column.getFilterValue() !== undefined &&
    (props.header.column.getFilterValue() as string[])?.length > 0;

  return (
    <TableCell
      as={TableCellTagMap.TH}
      width={props.header.getSize()}
      className={`${props.isEditable ? "bg-success-background text-success-foreground" : ""} 
      font-semibold text-left border-b border-border`}
    >
      {props.header.isPlaceholder ? null : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tooltip text={props.disableSort ? "" : dict.message.sort} placement="top-start">
              <div
                className={`flex items-center gap-2 ${props.disableSort ? "select-none" : "cursor-pointer"}`}
                onClick={!props.disableSort ? props.header.column.getToggleSortingHandler() : undefined}
                aria-label={props.header.column.columnDef.header as string}
              >
                {flexRender(
                  props.header.column.columnDef.header,
                  props.header.getContext()
                )}
                {!props.disableSort && ({
                  asc: (
                    <Icon className="material-symbols-outlined">arrow_upward</Icon>
                  ),
                  desc: (
                    <Icon className="material-symbols-outlined">
                      arrow_downward
                    </Icon>
                  ),
                }[props.header.column.getIsSorted() as string] ?? null)}
              </div>
            </Tooltip>
            {!props.disableFilter && <PopoverActionButton
              placement="bottom-start"
              panelClassName="w-sm xl:w-lg"
              leftIcon="filter_list"
              variant={isActiveFilter ? "secondary" : "ghost"}
              tooltipText={dict.action.filter}
              tooltipPosition="top-start"
              size="icon"
              className="ml-2"
              aria-label={interpolate(dict.action.filterBy, props.header.column.columnDef.header as string)}
              aria-selected={isActiveFilter}
              isOpen={showFilterDropdown}
              setIsOpen={setShowFilterDropdown}
              onClick={(event) => {
                event.stopPropagation();
                setShowFilterDropdown(!showFilterDropdown);
              }}
            >
              <RegistryFilter
                type={props.type}
                field={props.header.id}
                fieldType={(props.header.column.columnDef as EnhancedColumnDef<FieldValues>)?.dataType}
                lifecycleStage={props.lifecycleStage}
                selectedDate={props.selectedDate}
                filters={props.filters}
                onSubmission={(selectedOptions: string[]) => {
                  props.header.column.setFilterValue(selectedOptions);
                  props.table.resetRowSelection();
                  props.table.resetPageIndex();
                }
                } />
            </PopoverActionButton>
            }
          </div>
        </div>
      )}
    </TableCell>
  );
}
