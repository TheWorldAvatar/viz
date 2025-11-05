import { Icon } from "@mui/material";
import { flexRender, Header } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";

import { useFilterOptions } from "hooks/table/api/useFilterOptions";
import LoadingSpinner from "ui/graphic/loader/spinner";
import PopoverActionButton from "ui/interaction/action/popover/popover-button";
import Button from "ui/interaction/button";
import SelectOption from "ui/interaction/input/select-option";
import TableCell from "./table-cell";
import { LifecycleStage } from "types/form";

interface HeaderCellProps {
  type: string;
  lifecycleStage: LifecycleStage;
  header: Header<FieldValues, unknown>;
  resetRowSelection?: () => void;
}

/**
 * This component renders a header cell for the table.
 *
 * @param {string} type The entity type to query for.
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param { Header<FieldValues, unknown>} header The header object in Tanstack for further interactions.
 * @param resetRowSelection Optional row selection function to reset row when unused.
 */
export default function HeaderCell(props: Readonly<HeaderCellProps>) {
  const dict: Dictionary = useDictionary();
  const { options, isLoading, showFilterDropdown, setIsLoading, setShowFilterDropdown, setTriggerFetch } = useFilterOptions(props.type, props.header.id.toLowerCase(), props.lifecycleStage)
  const isActiveFilter: boolean = props.header.column.getFilterValue() !== undefined &&
    (props.header.column.getFilterValue() as string[])?.length > 0;
  const currentFilters: string[] = props.header.column.getFilterValue() as string[] ?? [];

  return (
    <TableCell
      width={props.header.getSize()}
      className={"bg-muted font-semibold text-foreground text-left border-b border-border"}
    >
      {props.header.isPlaceholder ? null : (
        <div className="flex flex-col gap-2">
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
            <PopoverActionButton
              placement="bottom-end"
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
              {options.length > 20 && <input
                type="text"
                placeholder="Filter not listed? Start typing..."
                aria-label={props.header.id + "filter-input"}
              />}
              {!isLoading && currentFilters.length > 0 && <Button
                leftIcon="filter_list_off"
                iconSize="medium"
                size="icon"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 300);
                  props.header.column.setFilterValue([]);
                  props.resetRowSelection();
                }}
                tooltipText={dict.action.clearAllFilters}
                variant="destructive"
              />}
              {isLoading && <LoadingSpinner isSmall={true} />}
              {!isLoading && <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <SelectOption
                    key={option}
                    option={option}
                    initialChecked={props.header.column.getFilterValue() !== null && currentFilters.includes(option)}
                    onClick={() => {
                      let filters: string[] = currentFilters;
                      if (filters.includes(option)) {
                        filters = currentFilters.filter((value) => value !== option);
                      } else {
                        filters.push(option);
                      }
                      props.header.column.setFilterValue(filters);
                      if (props.resetRowSelection) {
                        props.resetRowSelection();
                      }
                    }}
                  />
                ))}
              </div>}
            </PopoverActionButton>
          </div>
        </div>
      )}
    </TableCell>
  );
}
