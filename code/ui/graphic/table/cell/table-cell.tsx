import React from "react";
import useTableDensity from "@/hooks/table/useTableDensity";
import { TableCellTag, TableCellTagMap } from "@/types/table";

export interface TableCellProps {
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLTableCellElement>;
  as?: TableCellTag;
}

/**
 * This component renders a table cell.
 *
 * @param {number} width The width of the table cell.
 * @param {string} className Optional additional CSS classes for the cell.
 * @param {React.CSSProperties} style Optional inline styles for the cell, e.g. colours that cannot be expressed as classes.
 * @param {React.ReactNode} children The content of the cell.
 * @param  onClick The optional on click event handler for the cell.
 * @param {TableCellTag} as The HTML element to render, either "td" or "th". Defaults to "td".
 */
export default function TableCell(props: Readonly<TableCellProps>) {
  const { cellPadding, cellTextSize, rowMinHeight } = useTableDensity();
  const CellTag: TableCellTag = props.as ?? TableCellTagMap.TD;
  return (
    <CellTag
      style={{
        width: props.width,
        minWidth: props.width,
        ...props.style,
      }}
      onClick={props.onClick}
      className={`border-r border-border border-b ${cellPadding} ${cellTextSize} text-left font-normal last:border-r-0 ${props.className ?? ""
        }`}
    >
      <div className={`grid ${rowMinHeight} items-center`}>{props.children}</div>
    </CellTag>
  );
}
