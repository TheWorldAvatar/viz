import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface TableRowProps {
  id: string;
  isHeader: boolean;
  children: React.ReactNode;
}

/**
 * This component renders a table row. It is draggable for non-header rows.
 *
 * @param {string} id The unique identifier for the row. Useful for drag-and-drop functionality.
 * @param {boolean} isHeader Indicates if the row is a header row. Non-header rows are draggable.
 * @param {React.ReactNode} children The content of the row.
 */
export default function TableRow(props: Readonly<TableRowProps>) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: props.id,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      className={`border-b border-border text-left ${
        props.isHeader
          ? ""
          : `bg-background hover:bg-muted/50 group relative z-0 ${
              isDragging ? "z-10 opacity-70" : ""
            }`
      } `}
    >
      {props.children}
    </tr>
  );
}
