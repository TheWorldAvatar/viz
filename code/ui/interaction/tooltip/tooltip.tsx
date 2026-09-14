"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import React from "react";
import { useScreenType } from "@/hooks/screen/useScreenType";
import { ScreenType, ScreenTypeMap } from "@/types/settings";

export interface TooltipProps extends Pick<TooltipPrimitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset"> {
  text?: string;
  children: React.ReactElement;
}

const tooltipStyles: string = [
  "inline-flex w-fit max-w-sm items-center p-2",
  "bg-muted text-sm border border-border text-foreground rounded-md shadow-xs",
  "origin-[var(--transform-origin)] transition-[opacity,scale] duration-100 ease-out",
  "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.9]",
  "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]",
  "data-[instant]:transition-none",
].join(" ");

/**
 * A floating component to render labels upon hovering or focus.
 *
 * @param {string} text Optional tooltip text. When empty the child is rendered as-is with no tooltip.
 * @param {React.ReactElement} children The child element to render the trigger for.
 * @param {string} side Optional side of the trigger to show the tooltip on: "top", "bottom", "left" or "right". Defaults to "top".
 * @param {string} align Optional alignment along that side: "start", "center" or "end". Defaults to "center".
 * @param {number} sideOffset Optional gap in pixels between the tooltip and the trigger. Defaults to 8.
 * @param {number} alignOffset Optional shift in pixels along the alignment axis. Defaults to 0.
 */
export default function Tooltip({
  text,
  children,
  side = "top",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
}: Readonly<TooltipProps>) {
  const screenType: ScreenType = useScreenType();

  // Tooltips are desktop only, and there is nothing to anchor when the text is
  // missing or the child cannot receive the trigger props, so pass it straight through
  if (screenType !== ScreenTypeMap.DESKTOP || !text ||
    React.Children.count(children) !== 1 ||
    !React.isValidElement(children)) {
    return children;
  }

  return (

    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger
        delay={0}
        closeOnClick={false}
        render={children}
      />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className="z-tooltip"
        >
          <TooltipPrimitive.Popup className={tooltipStyles}>{text}</TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
