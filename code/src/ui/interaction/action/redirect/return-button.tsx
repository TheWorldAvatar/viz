"use client";

import { useRouter } from "next/navigation";
import React from "react";

import ActionButton, { ActionButtonProps } from "../action";

/**
 * An action button that redirects to the target url.
 *
 * @param {string} icon The Material icon name.

 * @param {string} label Optional label that is displayed on the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip positioning.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.active An optional styling object for the active state when active.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ReturnButton({
  icon,
  label,
  tooltipText,
  tooltipPosition,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<ActionButtonProps>) {
  const router = useRouter();

  const handleReturnClick: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    router.back();
  };
  return (
    <ActionButton
      icon={icon}
      label={label}
      tooltipText={tooltipText}
      tooltipPosition={tooltipPosition}
      className={rest.className}
      title={rest.title}
      onClick={handleReturnClick}
      isHoverableDisabled={isHoverableDisabled}
      isTransparent={isTransparent}
      styling={styling}
    />
  );
}
