import React from "react";

interface TableRowProps {
  isHeader?: boolean;
  children: React.ReactNode;
}

/**
 * This component renders a table row.
 *
 * @param {string | number} rowKey The unique key for the row.
 * @param {boolean} isHeader Indicates if the row is a header row.
 * @param {React.ReactNode} children The content of the row.
 */

export default function TableRow(props: Readonly<TableRowProps>) {
  return (
    <tr
      className={`border-b border-border ${
        props.isHeader ? "" : "bg-background hover:bg-muted/50"
      }`}
    >
      {props.children}
    </tr>
  );
}
