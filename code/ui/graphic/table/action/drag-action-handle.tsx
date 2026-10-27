import Button from "@/ui/interaction/button";

import { useSortable } from "@dnd-kit/sortable";
import useTableDensity from "@/hooks/table/useTableDensity";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { GripVertical } from "lucide-react";

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
  const { iconButtonSize } = useTableDensity();
  const { attributes, listeners } = useSortable({ id: props.id });

  return (
    <Button
      leftIcon={GripVertical}
      size={iconButtonSize}
      variant="ghost"
      disabled={props.disabled}
      {...attributes}
      {...listeners}
      tooltipText={dict.message.dragToReorder}
      tooltipDisableHoverablePopup
      aria-label={`${dict.message.dragToReorder}, ${props.id}`}
      className="hover:cursor-grab active:cursor-grabbing hover:bg-transparent"
    />
  );
}
