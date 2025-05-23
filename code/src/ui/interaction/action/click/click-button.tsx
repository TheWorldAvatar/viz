"use client";

import styles from "../action.module.css";

import ActionButton, { ActionButtonProps, ActionStyles } from "../action";

interface ClickActionButtonProps extends ActionButtonProps {
  isActive?: boolean;
  styling?: ActionStyles;
}

/**
 * A clickable button that performs the target action when a click mouse event is triggered.
 * Please ensure a onClick parameter is included.
 *
 * @param {string} icon The Material icon name.
 * @param {string} label Optional label that is displayed on the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip positioning.
 * @param {boolean} isActive Optional indicator to put the button in an active state if true.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.active An optional styling object for the active state when active.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ClickActionButton({
  icon,
  label,
  tooltipText,
  tooltipPosition,
  isActive,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<ClickActionButtonProps>) {
  return (
    <ActionButton
      icon={icon}
      className={`${isActive ? styling?.active ?? styles["active"] : ""} ${rest.className}`}
      label={label}
      tooltipText={tooltipText}
      tooltipPosition={tooltipPosition}
      onClick={rest.onClick}
      isHoverableDisabled={isHoverableDisabled}
      isTransparent={isTransparent}
      styling={styling}
    />
  );
}
