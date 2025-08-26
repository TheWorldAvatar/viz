import { DragEndEvent, KeyboardSensor, MouseSensor, SensorDescriptor, SensorOptions, TouchSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Table } from "@tanstack/react-table";
import { FieldValues } from "react-hook-form";

export interface DragAndDropDescriptor {
  dataIds: UniqueIdentifier[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (_event: DragEndEvent) => void;
}

/**
 * A custom hook to set up any drag and drop functionalities.
 *
 * @param {Table<FieldValues>} table - The core tanstack table model.
 * @param {FieldValues[]} data - The initial data to retrieve their unique identifiers.
 * @param setData - A dispatch method to update the table data.
 */
export function useTableDnd(
  table: Table<FieldValues>,
  data: FieldValues[],
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>,
): DragAndDropDescriptor {
  // Data IDs to maintain the order of rows during drag and drop
  const dataIds: UniqueIdentifier[] = data.map((row, index) => row.id + index) ?? [];

  const sensors: SensorDescriptor<SensorOptions>[] = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // This function updates the data order (row order) based on the drag and drop interaction
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const currentPageIndex: number = table.getState().pagination.pageIndex;
      setData((prev) => {
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
          table.setPageIndex(currentPageIndex);
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
