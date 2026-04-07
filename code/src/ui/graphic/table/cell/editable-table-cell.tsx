import TableCell, { TableCellProps } from "./table-cell";

interface EditableTableCellProps extends TableCellProps {
  isBulkEditMode: boolean;
}

/**
 * This component renders an editable table cell that has to be activated by clicking it.
 *
 * @param {boolean} isBulkEditMode Indicates if the cell is in bulk edit mode.
 * @param {number} width The width of the table cell.
 * @param {string} className Optional additional CSS classes for the cell.
 * @param {React.ReactNode} children The content of the cell.
 * @param onClick The optional on click event handler for the cell.
 */
export default function EditableTableCell(props: Readonly<EditableTableCellProps>) {
  return (
    <TableCell
      width={props.width}
      className={`${props.className} ${props.isBulkEditMode ? "cursor-default" : "cursor-pointer"}`}
      onClick={props.onClick}
    >
      {props.isBulkEditMode ? <div>Placeholder</div> :
        props.children}
    </TableCell>
  );
}
