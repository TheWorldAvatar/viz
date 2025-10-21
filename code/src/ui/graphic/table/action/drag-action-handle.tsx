import Button from "ui/interaction/button";

import { useSortable } from "@dnd-kit/sortable";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";

interface DragActionHandleProps {
  id: string;
  disabled?: boolean;
}

/**
 * Renders the drag action handle for each row in the registry.
 *
 * @param {string} id The drag id.
 * @param {boolean} disabled Whether the drag handle is disabled.
 */
export default function DragActionHandle(
  props: Readonly<DragActionHandleProps>
) {
  const dict: Dictionary = useDictionary();
  const { attributes, listeners } = useSortable({ id: props.id });

  return (
    <Button
      leftIcon="drag_indicator"
      size="icon"
      variant="ghost"
      disabled={props.disabled}
      {...attributes}
      {...listeners}
      tooltipText={dict.message.dragToReorder}
      className="cursor-grab hover:cursor-grabbing hover:bg-transparent border-r-2 border-border/80 border-t-1"
    />
  );
}
