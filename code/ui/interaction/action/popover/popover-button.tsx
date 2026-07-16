"use client";

import { useDraggableSheet } from "@/hooks/float/useDraggableSheet";
import { NO_PULL_REFRESH_ATTRIBUTE } from "@/hooks/screen/usePullToRefresh";
import { usePopover } from "@/hooks/float/usePopover";
import { useScreenType } from "@/hooks/screen/useScreenType";
import { ScreenType, ScreenTypeMap } from "@/types/settings";
import Button, { ButtonProps } from "@/ui/interaction/button";
import {
  FloatingFocusManager,
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import React from "react";

interface PopoverActionButtonProps extends ButtonProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  placement?: Placement;
  draggable?: boolean;
  bottomSheet?: boolean;
}

/**
 * A clickable button that acts as an anchor for the popover floating element. 
 * Note the open floating element will render differently for mobile.
 *
 * @param {ReactNode} children Children elements that are shown in the popover floating element.
 * @param {boolean} isOpen Optional state for popover.
 * @param setIsOpen Optional dispatch action to control the open state of popover.
 * @param onClose Optional actions to perform on close.
 * @param {Placement} placement Optional position of popover.
 * @param {boolean} draggable Optional flag to render a drag handle on the bottom sheet, allowing the sheet to be dismissed by dragging it past the bottom.
 * @param {boolean} bottomSheet Optional flag to force the bottom-sheet presentation on larger screens; mobile always renders as a sheet.
 * @param {string} label Optional label that is displayed on the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip positioning.
 * @param {string} leftIcon Optional left icon, can be a string or React node.
 * @param {string} rightIcon Optional right icon, can be a string or React node.
 * @param {string} size Optional button size, e.g., "sm", "md", "lg", "default", or "icon".
 * @param {string} variant Optional button variant, e.g., "primary", "secondary", "destructive", etc.
 * @param {ButtonProps} rest Additional button properties that are passed to the button component.
 */
export default function PopoverActionButton({
  children,
  isOpen,
  setIsOpen,
  onClose,
  placement,
  draggable,
  bottomSheet,
  leftIcon,
  rightIcon,
  label,
  size,
  tooltipText,
  tooltipPosition,
  variant,
  ...rest
}: Readonly<PopoverActionButtonProps>) {
  const validChildren: React.ReactNode[] = React.Children.toArray(children) as React.ReactNode[];
  const screenType: ScreenType = useScreenType();
  // The popover is presented as a full-width bottom sheet on mobile, or whenever a caller
  // explicitly opts in via `bottomSheet` (e.g. to force the "from below" look on tablet).
  const isSheet: boolean = screenType == ScreenTypeMap.MOBILE || bottomSheet;
  const isDraggable: boolean = draggable && isSheet;

  const popover = usePopover(placement, isOpen, rest.disabled, setIsOpen, onClose);
  const transition = useTransitionStyles(popover.context, {
    duration: isSheet ? 400 : 200,
    initial: isSheet ? {
      opacity: 0,
      transform: "translateY(100%)",
    } : {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });
  const floatingStyles: React.CSSProperties = isSheet
    ? {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      // Second highest z-index so it is below the tooltips
      zIndex: 999998,
    }
    : {
      ...popover.floatingStyles,
      // Second highest z-index so it is below the tooltips
      zIndex: 999998,
    };

  const sheet: ReturnType<typeof useDraggableSheet> = useDraggableSheet({
    enabled: isDraggable,
    isOpen: popover.isOpen,
    onClose: () => popover.setIsOpen(false),
  });

  if (validChildren.length === 0) {
    return null;
  }
  return (
    <>
      <div ref={popover.refs.setReference} {...popover.getReferenceProps()} className={rest.disabled ? "cursor-not-allowed" : ""}>
        <Button
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          className={rest.className}
          label={label}
          tooltipText={tooltipText}
          tooltipPosition={tooltipPosition}
          onClick={rest.onClick}
          size={size}
          variant={variant}
          {...rest}
        />
      </div>
      {popover.isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={popover.context} modal={false}>
            <div
              ref={popover.refs.setFloating}
              style={isDraggable ? { ...floatingStyles, pointerEvents: "none" } : floatingStyles}
              {...popover.getFloatingProps()}
              {...{ [NO_PULL_REFRESH_ATTRIBUTE]: "" }}
            >
              {isDraggable ? (
                <div style={{ ...transition.styles }}>
                  <div
                    ref={sheet.sheetRef}
                    style={{ ...sheet.sheetStyle, pointerEvents: "auto" }}
                    className="flex flex-col gap-y-2 p-2 bg-muted border border-border shadow-md rounded-t-lg"
                  >
                    <div
                      {...sheet.dragHandleProps}
                      className="flex shrink-0 cursor-grab touch-none items-center justify-center -mx-2 -mt-2 px-2 pt-3 pb-2 active:cursor-grabbing"
                      role="separator"
                      aria-label="Drag to resize"
                    >
                      <span className="h-1.5 w-12 rounded-full bg-border" />
                    </div>
                    {children}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    ...transition.styles,
                  }}
                  className={`flex flex-col gap-y-2 p-2 bg-muted border border-border shadow-md
                    ${isSheet ? "rounded-t-lg" : "rounded-lg"}`}
                >
                  {children}
                </div>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal >
      )
      }
    </>
  );
}
