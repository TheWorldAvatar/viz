"use client";

import { usePopover } from "@/hooks/float/usePopover";
import { useScreenType } from "@/hooks/useScreenType";
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

  const popover = usePopover(placement, isOpen, setIsOpen, onClose);
  const transition = useTransitionStyles(popover.context, {
    duration: screenType == ScreenTypeMap.MOBILE ? 400 : 200,
    initial: screenType == ScreenTypeMap.MOBILE ? {
      opacity: 0,
      transform: "translateY(100%)",
    } : {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });
  const floatingStyles: React.CSSProperties = screenType == ScreenTypeMap.MOBILE
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

  if (validChildren.length === 0) {
    return null;
  }
  return (
    <>
      <div ref={popover.refs.setReference} {...popover.getReferenceProps()}>
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
              style={floatingStyles}
              {...popover.getFloatingProps()}
            >
              <div
                style={{
                  ...transition.styles,
                }}
                className={`flex flex-col gap-y-2 p-2 bg-muted border border-border shadow-md
                  ${screenType == ScreenTypeMap.MOBILE ? "rounded-t-lg" : "rounded-lg"}`}
              >
                {children}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal >
      )
      }
    </>
  );
}
