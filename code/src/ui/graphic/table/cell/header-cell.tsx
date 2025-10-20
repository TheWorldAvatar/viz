import { Icon } from "@mui/material";
import { flexRender, Header } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";

import MultivalueSelector from "ui/interaction/dropdown/multivalue-selector";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";
import TableCell from "./table-cell";

interface HeaderCellProps {
  options: string[];
  header: Header<FieldValues, unknown>;
}

/**
 * This component renders a header cell for the table.
 *
 * @param {string[]} options The list of values available for filtering.
 * @param { Header<FieldValues, unknown>} header The header object in Tanstack for further interactions.
 */

export default function HeaderCell(props: Readonly<HeaderCellProps>) {
  const dict: Dictionary = useDictionary();
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(null);

  useEffect(() => {
    if (selectedOptions) {
      props.header.column.setFilterValue(
        selectedOptions.map((opt) => opt.value)
      );
    }
  }, [selectedOptions]);

  return (
    <TableCell
      width={props.header.getSize()}
      className={"bg-muted font-semibold text-foreground text-left border-b border-border"}
    >
      {props.header.isPlaceholder ? null : (
        <div className="flex flex-col gap-2">
          <div
            className={`flex items-center gap-2 ${props.header.column.getCanSort()
              ? "cursor-pointer select-none "
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
          <div className="w-full min-w-36 h-full">
            <MultivalueSelector
              title={dict.action.filter}
              options={props.options.sort().map((col) => {
                // For status column, show translated label but use actual value
                // This is because the filter function checks against actual value, not the label
                const label: string = props.header.id.toLowerCase() === "status" ? dict.title[col.toLowerCase()] : col;

                return {
                  label: label,
                  value: col,
                };
              })}
              toggleAll={false}
              isActive={
                props.header.column.getFilterValue() !== undefined &&
                (props.header.column.getFilterValue() as string[])?.length > 0
              }
              setControlledSelectedOptions={setSelectedOptions}
            />
          </div>
        </div>
      )}
    </TableCell>
  );
}
