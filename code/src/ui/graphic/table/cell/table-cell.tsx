import React from "react";

interface TableCellProps {
  width?: number;
  className?: string;
  children?: React.ReactNode;
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
      className={`border-r border-border p-2 md:p-3 whitespace-nowrap text-lg font-normal last:border-none ${props.className ?? ""}`}
    >
      {props.children}
    </th>
  );
}
