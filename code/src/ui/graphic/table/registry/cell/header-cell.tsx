import { Icon } from "@mui/material";
import { flexRender, Header } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { FieldValues } from "react-hook-form";

import MultivalueSelector from "ui/interaction/dropdown/multivalue-selector";
import { SelectOption } from "ui/interaction/dropdown/simple-selector";

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
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(null);

  useEffect(() => {
    if (selectedOptions) {
      props.header.column.setFilterValue(selectedOptions.map((opt) => opt.value));
    }
  }, [selectedOptions])

  return (
    <th style={{
      width: props.header.getSize(),
      minWidth: props.header.getSize(),
    }} className={"bg-muted font-semibold text-foreground text-left border-r border-border p-2 md:p-3 whitespace-nowrap text-lg font-normal"}>
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
                <Icon className="material-symbols-outlined">arrow_downward</Icon>
              ),
            }[props.header.column.getIsSorted() as string] ??
              null}
          </div>
          <div className="w-full min-w-36">
            <MultivalueSelector
              title="Filter"
              options={props.options.map((col) => {
                return {
                  label: col,
                  value: col,
                }
              })}
              toggleAll={false}
              isActive={props.header.column.getFilterValue() !== undefined && (props.header.column.getFilterValue() as string[])?.length > 0}
              setControlledSelectedOptions={setSelectedOptions}
            />
          </div>
        </div>
      )}
    </th>
  );
}
