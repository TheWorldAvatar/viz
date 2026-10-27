"use client";

import { Info } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";
import { useScreenType } from "@/hooks/screen/useScreenType";
import { Dictionary } from "@/types/dictionary";
import { ScreenType, ScreenTypeMap } from "@/types/settings";
import PopoverActionButton from "@/ui/interaction/action/popover/popover-button";
import Tooltip from "@/ui/interaction/tooltip/tooltip";

interface InfoHintProps {
  text: string;
}

/**
 * An information icon that reveals additional text. Shows a tooltip on hover for desktop,
 * and a tappable popover on other devices where hover is unavailable.
 *
 * @param {string} text The information text to display.
 */
export default function InfoHint({ text }: Readonly<InfoHintProps>) {
  const dict: Dictionary = useDictionary();
  const screenType: ScreenType = useScreenType();

  if (!text) {
    return null;
  }

  if (screenType === ScreenTypeMap.DESKTOP) {
    return (
      <Tooltip text={text} side="right">
        <Info className="size-5.5" aria-hidden />
      </Tooltip>
    );
  }

  return (
    <PopoverActionButton
      placement="top"
      bottomSheet={false}
      leftIcon={Info}
      variant="ghost"
      size="icon-lg"
      className="-mx-2"
      aria-label={dict.action.moreInfo}
    >
      <div className="p-1 text-sm md:text-base text-foreground whitespace-pre-line max-w-2xs">
        {text}
      </div>
    </PopoverActionButton>
  );
}
