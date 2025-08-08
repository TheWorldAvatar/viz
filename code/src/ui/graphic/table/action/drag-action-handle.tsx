

import Button from "ui/interaction/button";

import { useSortable } from "@dnd-kit/sortable";

interface DragActionHandleProps {
  id: string;
}

/**
 * Renders the drag action handle for each row in the registry.
 *
 * @param {string} id The drag id.
 */
export default function DragActionHandle(
  props: Readonly<DragActionHandleProps>
) {
  const { attributes, listeners } = useSortable({ id: props.id, });

  return (
    <Button
      leftIcon="drag_indicator"
      size="icon"
      variant="ghost"
      {...attributes}
      {...listeners}
      className="cursor-grab hover:cursor-grabbing hover:bg-transparent"
    >
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}