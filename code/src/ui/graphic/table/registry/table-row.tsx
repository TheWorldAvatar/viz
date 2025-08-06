import React from "react";

interface TableRowProps {
  isHeader?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  ref?: React.Ref<HTMLTableRowElement>;
}

/**
 * This component renders a table row.
 *

 * @param {boolean} isHeader Indicates if the row is a header row.
 * @param {React.ReactNode} children The content of the row.
 * @param {React.CSSProperties} style Optional inline styles for the row.
 * @param {string} className Optional additional CSS classes for the row.
 * @param {React.Ref<HTMLTableRowElement>} ref Optional ref to access the row element
 */

export default function TableRow(props: Readonly<TableRowProps>) {
  return (
    <tr
      ref={props.ref}
      style={props.style}
      className={`border-b border-border ${
        props.isHeader ? "" : "bg-background hover:bg-muted/50"
      } ${props.className || ""}`}
    >
      {props.children}
    </tr>
  );
}
