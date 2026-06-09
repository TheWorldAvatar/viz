import { DragEndEvent, KeyboardSensor, MouseSensor, SensorDescriptor, SensorOptions, TouchSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TableRowHandle } from "ui/graphic/table/row/table-row";
import { TableDescriptor } from "./useTable";

export interface DragAndDropDescriptor {
  dataIds: UniqueIdentifier[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (_event: DragEndEvent) => void;
}

/**
 * A custom hook to set up any drag and drop functionalities.
 *
 * @param {TableDescriptor} tableDescriptor - The table descriptor containing functionalities like the table and initial data.
 * @param {React.RefObject<TableRowHandle[]>} selectedRows - Stores the currently selected rows in bulk edit mode.
 */
export function useTableDnd(
  tableDescriptor: TableDescriptor,
  selectedRows: React.RefObject<TableRowHandle[]>,
): DragAndDropDescriptor {
  // Data IDs to maintain the order of rows during drag and drop
  const dataIds: UniqueIdentifier[] = tableDescriptor.data.map((row, index) => row.id + index) ?? [];

  const sensors: SensorDescriptor<SensorOptions>[] = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // This function updates the data order (row order) based on the drag and drop interaction
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    selectedRows.current = [];
    tableDescriptor.table.resetRowSelection();
    if (active && over && active.id !== over.id) {
      const currentPageIndex: number = tableDescriptor.table.getState().pagination.pageIndex;
      tableDescriptor.setData((prev) => {
        const oldIndex: number = dataIds.findIndex(
          (record) => record == active.id
        );
        const newIndex: number = dataIds.findIndex(
          (record) => record == over.id
        );
        // Hacky solution to reset pagination after reordering
        // A better solution is that pagination is stored in a state outside of this component and
        // we need to change the default pagination functionality in Tanstack as it is the source of this issue
        setTimeout(() => {
          tableDescriptor.table.setPageIndex(currentPageIndex);
        }, 0);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }
  return {
    dataIds,
    sensors,
    handleDragEnd,
  }
}
