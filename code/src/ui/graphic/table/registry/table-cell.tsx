import React from "react";

interface TableCellProps {
  isHeader?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
}

/**
 * This component renders a table cell.
 *
 * @param {boolean} isHeader Indicates if the cell is a header cell.
 * @param {React.CSSProperties} style Optional inline styles for the cell.
 * @param {React.ReactNode} children The content of the cell.
 * @param {string} className Optional additional CSS classes for the cell.
 */

export default function TableCell(props: Readonly<TableCellProps>) {
  const baseClasses =
    "border-r border-border p-2 md:p-3 whitespace-nowrap text-lg font-normal last:border-none";
  const isHeaderClasses = props.isHeader
    ? "bg-muted font-semibold text-foreground text-left"
    : "";

  return (
    <th
      style={props.style}
      className={`${baseClasses} ${isHeaderClasses} ${props.className || ""}`}
    >
      {props.children}
    </th>
  );
}
