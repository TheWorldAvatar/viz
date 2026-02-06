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
import TableCell from "./table-cell";
import NumericColumnFilter from "../action/numeric-column-filter";

interface HeaderCellProps {
  type: string;
  table: Table<FieldValues>;
  header: Header<FieldValues, unknown>;
  lifecycleStage: LifecycleStage;
  selectedDate: DateRange;
  disableFilter: boolean;
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
 * @param {boolean} disableFilter Disables the filters when set to true.
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

  const showNumericFilter: boolean = options.length > 0 &&
    options.every((option) => option.trim() !== "" && !Number.isNaN(Number(option)));

  return (
    <TableCell
      width={props.header.getSize()}
      className={"bg-muted font-semibold text-foreground text-left border-b border-border"}
    >
      {props.header.isPlaceholder ? null : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tooltip text={dict.message.sort} placement="top-start">
              <div
                className={`flex items-center gap-2 ${props.header.column.getCanSort()
                  ? "cursor-pointer select-none"
                  : ""
                  }`}
                onClick={props.header.column.getToggleSortingHandler()}
                aria-label={
                  props.header.column.getCanSort()
                    ? `Sort by ${props.header.column.columnDef.header}`
                    : undefined
                }
              >
                {flexRender(
                  props.header.column.columnDef.header,
                  props.header.getContext()
                )}
                {{
                  asc: (
                    <Icon className="material-symbols-outlined">arrow_upward</Icon>
                  ),
                  desc: (
                    <Icon className="material-symbols-outlined">
                      arrow_downward
                    </Icon>
                  ),
                }[props.header.column.getIsSorted() as string] ?? null}
              </div>
            </Tooltip>
            {!props.disableFilter && <PopoverActionButton
              placement="bottom-start"
              leftIcon="filter_list"
              variant={isActiveFilter ? "secondary" : "ghost"}
              tooltipText={dict.action.filter}
              size="icon"
              className="ml-2"
              isOpen={showFilterDropdown}
              setIsOpen={setShowFilterDropdown}
              onClick={(event) => {
                event.stopPropagation();
                setTriggerFetch(!showFilterDropdown);
                setShowFilterDropdown(!showFilterDropdown);
              }}
            >

              {showNumericFilter ? (
                <NumericColumnFilter
                  options={options}
                  label={props.header.id}
                  onSubmission={(selectedOptions: string[]) => {
                    props.header.column.setFilterValue(selectedOptions);
                    props.table.resetRowSelection();
                    props.table.resetPageIndex();
                  }}
                />
              ) : (
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
              )}
              {isLoading && <LoadingSpinner isSmall={true} />}
            </PopoverActionButton>
            }
          </div>
        </div>
      )}
    </TableCell>
  );
}
