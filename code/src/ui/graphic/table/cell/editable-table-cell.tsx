import { UseFormReturn } from "react-hook-form";
import { PropertyShape } from "types/form";
import LoadingSpinner from "ui/graphic/loader/spinner";
import { renderFormField } from "ui/interaction/form/form";
import TableCell, { TableCellProps } from "./table-cell";

interface EditableTableCellProps extends TableCellProps {
  isBulkEditMode: boolean;
  fieldShape: PropertyShape;
  form: UseFormReturn;
}

/**
 * This component renders an editable table cell that has to be activated by clicking it.
 *
 * @param {boolean} isBulkEditMode Indicates if the cell is in bulk edit mode.
 * @param {number} width The width of the table cell.
 * @param {string} className Optional additional CSS classes for the cell.
 * @param {PropertyShape} fieldShape The shape of the field for the cell.
 * @param {UseFormReturn} form A react-hook-form hook containing methods and state for managing the associated form.
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
      {props.isBulkEditMode ?
        // If in bulk edit mode, render the form field if it is not retrieving the data from backend
        props.fieldShape != undefined ? renderFormField("", props.fieldShape, props.form, 0) :
          <LoadingSpinner isSmall={true} /> :
        props.children}
    </TableCell>
  );
}
