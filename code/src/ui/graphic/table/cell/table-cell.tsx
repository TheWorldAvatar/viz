import React from "react";

interface TableCellProps {
  width?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLTableCellElement>;
}

/**
 * This component renders a table cell.
 *
 * @param {number} width The width of the table cell.
 * @param {string} className Optional additional CSS classes for the cell.
 * @param {React.ReactNode} children The content of the cell.
 */
export default function TableCell(props: Readonly<TableCellProps>) {
  return (
    <th
      style={{
        width: props.width,
        minWidth: props.width,
      }}
      onClick={props.onClick}
      className={`border-r border-border border-b p-2 md:p-3 whitespace-nowrap text-lg text-left  font-normal last:border-r-0 ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </th>
  );
}
