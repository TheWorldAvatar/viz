"use client";

import {
  FloatingFocusManager,
  FloatingPortal,
  Placement,
  useTransitionStyles,
} from "@floating-ui/react";
import { usePopover } from "@/hooks/float/usePopover";
import React from "react";
import Button, { ButtonProps } from "@/ui/interaction/button";

interface PopoverActionButtonProps extends ButtonProps {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  placement?: Placement;
}

/**
 * A clickable button that acts as an anchor for the popover floating element.
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
  const popover = usePopover(placement, isOpen, setIsOpen, onClose);
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

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
              style={{
                ...popover.floatingStyles,
                zIndex: 999998, // Second highest z-index so it is below the tooltips
              }}
              {...popover.getFloatingProps()}
            >
              <div
                style={{
                  ...transition.styles,
                }}
                className="flex flex-col gap-y-2 p-2 bg-muted border border-border rounded-lg shadow-md"
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
