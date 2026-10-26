import Button from "@/ui/interaction/button";

import { useSortable } from "@dnd-kit/sortable";
import useTableSession from "@/hooks/table/useTableSession";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { TableDensityMap } from "@/types/table";
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
  const { tableDensity } = useTableSession();
  const { attributes, listeners } = useSortable({ id: props.id });

  return (
    <Button
      leftIcon={GripVertical}
      size={tableDensity === TableDensityMap.COMPACT ? "icon-xs" : "icon"}
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
