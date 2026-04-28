import { Icon } from "@mui/material";
import { ColumnFilter, flexRender, Header, Table } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";

import { useFilterOptions } from "hooks/table/api/useFilterOptions";
import { DateRange } from "react-day-picker";
import { LifecycleStage } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import SearchSelector from "ui/interaction/dropdown/search-selector";
import Tooltip from "ui/interaction/tooltip/tooltip";
import { interpolate } from "utils/client-utils";
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
  const isActiveFilter: boolean = props.header.column.getFilterValue() !== undefined &&
    (props.header.column.getFilterValue() as string[])?.length > 0;
  const currentFilters: string[] = props.header.column.getFilterValue() as string[] ?? [];

  const {
    options,
    search,
    isLoading,
    showFilterDropdown,
    setSearch,
    setShowFilterDropdown,
    setTriggerFetch
  } = useFilterOptions(
    props.type,
    props.header.id.toLowerCase(),
    props.lifecycleStage,
    props.selectedDate,
    currentFilters,
    props.filters,
  );

  return (
    <TableCell
      as="th"
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
              leftIcon="filter_list"
              variant={isActiveFilter ? "secondary" : "ghost"}
              tooltipText={dict.action.filter}
              size="icon"
              className="ml-2"
              aria-label={interpolate(dict.action.filterBy, props.header.column.columnDef.header as string)}
              aria-selected={isActiveFilter}
              isOpen={showFilterDropdown}
              setIsOpen={setShowFilterDropdown}
              onClick={(event) => {
                event.stopPropagation();
                setTriggerFetch(!showFilterDropdown);
                setShowFilterDropdown(!showFilterDropdown);
              }}
            >
              <SearchSelector
                searchString={search}
                options={options}
                label={props.header.id}
                initSelectedOptions={currentFilters}
                showOptions={!isLoading}
                onSubmission={(selectedOptions: string[]) => {
                  props.header.column.setFilterValue(selectedOptions);
                  props.table.resetRowSelection();
                  props.table.resetPageIndex();
                }}
                setSearchString={setSearch}
              />
              {isLoading && <LoadingSpinner isSmall={true} />}
            </PopoverActionButton>
            }
          </div>
        </div>
      )}
    </TableCell>
  );
}
