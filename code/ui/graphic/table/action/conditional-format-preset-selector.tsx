import { ConditionalFormatPresetDescriptor } from "@/hooks/table/settings/useConditionalFormatPresets";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import { ConditionalFormatSetting } from "@/types/table";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import Button from "@/ui/interaction/button";
import { Check, TableCellsMerge } from "lucide-react";
import React from "react";


/**
 * An icon button that opens a menu to select the conditional formatting presets of a table.
 * The button is highlighted when active, so that no text is needed on the ribbon.
 */
export default function ConditionalFormatPresetSelector(props: Readonly<ConditionalFormatPresetDescriptor>) {
  const dict: Dictionary = useDictionary();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const labelId: string = React.useId();

  const handleSelect = (preset: ConditionalFormatSetting | null): void => {
    props.updateCurrentConditionalFormatPreset(preset);
    setIsOpen(false);
  };

  return (
    <PopoverActionButton
      placement="bottom-end"
      leftIcon={TableCellsMerge}
      size="icon"
      variant={props.currentConditionalFormatPreset ? "info_banner" : "outline"}
      tooltipText={dict.title.conditionalFormat}
      aria-label={dict.title.conditionalFormat}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex flex-col gap-1 min-w-56 max-h-80 overflow-y-auto"
      >
        <p id={labelId} className="sticky top-0 z-10 bg-muted px-2 py-1 font-semibold">
          {dict.title.conditionalFormat}
        </p>
        {/* The default option applies no conditional formats */}
        <CellFormatPreset
          label={dict.title.default}
          isActive={!props.currentConditionalFormatPreset}
          onClick={() => handleSelect(null)}
        />
        {props.conditionalFormatPresets.map((preset) => (
          <CellFormatPreset
            key={preset.conditional_format}
            label={preset.conditional_format}
            isActive={preset.conditional_format === props.currentConditionalFormatPreset?.conditional_format}
            onClick={() => handleSelect(preset)}
          />
        ))}
      </div>
    </PopoverActionButton>
  );
}

interface CellFormatPresetProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * An option in the conditional format preset menu, with a check mark when active.
 *
 * @param {string} label The display name of the option.
 * @param {boolean} isActive Indicates if the option is the active selection.
 * @param onClick Click handler for the option.
 */
function CellFormatPreset(props: Readonly<CellFormatPresetProps>) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      aria-pressed={props.isActive}
      onClick={props.onClick}
    >
      <span className="flex w-full items-center gap-2">
        {props.isActive
          ? <Check className="size-4 shrink-0" aria-hidden="true" />
          : <span className="size-4 shrink-0" aria-hidden="true" />}
        <span className="truncate">{props.label}</span>
      </span>
    </Button>
  );
}
