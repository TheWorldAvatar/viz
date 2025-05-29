"use client";

import styles from "../action.module.css";

import ActionButton, { ActionButtonProps } from "../action";
import { usePopover } from "hooks/float/usePopover";
import { FloatingPortal, Placement, useTransitionStyles } from "@floating-ui/react";

interface PopoverActionButtonProps extends ActionButtonProps {
  children: React.ReactNode;
  placement?: Placement;
}

/**
 * A clickable button that acts as an anchor for the popover floating element.
 *
 * @param {ReactNode} children Children elements that are shown in the popover floating element.
 * @param {Placement} placement Optional position of popover.
 * @param {string} icon The Material icon name.
 * @param {string} label Optional label that is displayed on the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip positioning.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 * @param {string} styling.container An optional styling object for the pop up container.
 */
export default function PopoverActionButton({
  children,
  placement,
  icon,
  label,
  tooltipText,
  tooltipPosition,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<PopoverActionButtonProps>) {
  const popover = usePopover(placement);
  const transition = useTransitionStyles(popover.context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.9)",
    },
  });

  return (
    <>
      <div
        ref={popover.refs.setReference}
        {...popover.getReferenceProps()}
      >
        <ActionButton
          icon={icon}
          className={rest.className}
          label={label}
          tooltipText={tooltipText}
          tooltipPosition={tooltipPosition}
          onClick={rest.onClick}
          isHoverableDisabled={isHoverableDisabled}
          isTransparent={isTransparent}
          styling={styling}
        />
      </div>
      {popover.isOpen && <FloatingPortal>
        <div
          ref={popover.refs.setFloating}
          style={{
            ...popover.floatingStyles,
            zIndex: 999998 // Second highest z-index so it is below the tooltips
          }}
          {...popover.getFloatingProps()}
        >
          <div
            style={{
              ...transition.styles,
            }}
            className={`${styles.popover} ${styling?.container}`}
          >
            {children}
          </div>
        </div>
      </FloatingPortal >}
    </>
  );
}
