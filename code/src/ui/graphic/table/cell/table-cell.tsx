import React from "react";
import { TableCellTag } from "types/table";

export interface TableCellProps {
  width?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLTableCellElement>;
  as?: TableCellTag;
}

/**
 * This component renders a table cell.
 *
 * @param {number} width The width of the table cell.
 * @param {string} className Optional additional CSS classes for the cell.
 * @param {React.ReactNode} children The content of the cell.
 * @param  onClick The optional on click event handler for the cell.
 * @param {TableCellTag} as The HTML element to render, either "td" or "th". Defaults to "td".
 */
export default function TableCell(props: Readonly<TableCellProps>) {
  const CellTag: TableCellTag = props.as ?? "td";
  return (
    <CellTag
      style={{
        width: props.width,
        minWidth: props.width,
      }}
      onClick={props.onClick}
      className={`border-r border-border border-b p-1.5 px-2 text-lg text-left  font-normal last:border-r-0 ${props.className ?? ""
        }`}
    >
      {props.children}
    </CellTag>
  );
}
