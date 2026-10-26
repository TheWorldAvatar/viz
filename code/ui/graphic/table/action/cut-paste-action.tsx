import Button from "@/ui/interaction/button";

import useTableSession from "@/hooks/table/useTableSession";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import { CircleChevronDown, CircleChevronUp, ClipboardPaste, Scissors } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { useEffect } from "react";

interface CutPasteActionProps {
  id: string;
  disabled: boolean;
}

/**
 * Renders the cut and paste actions for the registry planner.
 *
 * @param {string} id The row id based on index.
 * @param {boolean} disabled Indicates if the action should be disabled
 */
export default function CutPasteAction(
  props: Readonly<CutPasteActionProps>
) {
  const dict: Dictionary = useDictionary();
  const { activeCutRowId, tableDescriptor, setActiveCutRowId } = useTableSession();

  const onPaste = (insertBelow: boolean) => {
    tableDescriptor.table.resetRowSelection();
    const oldIndex: number = tableDescriptor.data.findIndex((record, index) => (record.id + index) == activeCutRowId);
    const newIndex: number = tableDescriptor.data.findIndex((record, index) => (record.id + index) == props.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex == newIndex) {
      return;
    }
    const updatedRows: FieldValues[] = [...tableDescriptor.data];
    const [cutRow] = updatedRows.splice(oldIndex, 1);
    let insertIndex: number;
    if (oldIndex > newIndex) {
      insertIndex = insertBelow ? newIndex + 1 : newIndex;
    } else {
      insertIndex = insertBelow ? newIndex : newIndex - 1;
    }
    updatedRows.splice(insertIndex, 0, cutRow);
    tableDescriptor.syncOrder(updatedRows, insertIndex);
    tableDescriptor.setData(updatedRows);
    setActiveCutRowId(null);
  }

  // Handle Escape key to cancel cut action
  useEffect(() => {
    if (activeCutRowId !== props.id) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCutRowId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [activeCutRowId, props.id, setActiveCutRowId]);

  return (
    <>
      {(!activeCutRowId || (activeCutRowId && activeCutRowId == props.id)) && <Button
        leftIcon={Scissors}
        size="icon"
        variant={activeCutRowId == props.id ? "active" : "ghost"}
        disabled={props.disabled || !!activeCutRowId}
        onClick={() => {
          setActiveCutRowId(props.id);
        }}
        tooltipText={dict.action.cut}
        tooltipDisableHoverablePopup
        aria-label={`${dict.action.cut}, ${props.id}`}
      />}
      {(activeCutRowId && activeCutRowId != props.id) && <PopoverActionButton
        leftIcon={ClipboardPaste}
        placement="right"
        size="icon"
        variant={"ghost"}
        disabled={props.disabled}
        tooltipText={dict.action.paste}
        tooltipDisableHoverablePopup
        aria-label={`${dict.action.paste}, ${props.id}`}
      >
        <Button
          leftIcon={CircleChevronUp}
          size="icon"
          variant={"ghost"}
          disabled={props.disabled}
          onClick={() => { onPaste(false); }}
          tooltipText={dict.action.insertAbove}
          tooltipDisableHoverablePopup
          aria-label={`${dict.action.insertAbove}, ${props.id}`}
        />
        <Button
          leftIcon={CircleChevronDown}
          size="icon"
          variant={"ghost"}
          disabled={props.disabled}
          onClick={() => { onPaste(true); }}
          tooltipText={dict.action.insertBelow}
          tooltipDisableHoverablePopup
          aria-label={`${dict.action.insertBelow}, ${props.id}`}
        />
      </PopoverActionButton>}
    </>
  );
}
