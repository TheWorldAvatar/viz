"use client";

import styles from "./action.module.css";

import { Placement } from "@floating-ui/react";
import { Icon } from "@mui/material";
import React from "react";
import Tooltip from "ui/interaction/tooltip/tooltip";

export interface ActionButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: string;
  label?: string;
  tooltipText?: string;
  tooltipPosition?: Placement;
  isHoverableDisabled?: boolean;
  isTransparent?: boolean;
  styling?: ActionStyles;
}

export interface ActionStyles {
  active?: string;
  hover?: string;
  text?: string;
  container?: string;
}

/**
 * A generic action button template class.
 *
 * @param {string} icon The Material icon name.
 * @param {string} label Optional label that is displayed on the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip positioning.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.active Unused in this button.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ActionButton({
  icon,
  label,
  tooltipText,
  tooltipPosition,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<ActionButtonProps>) {
  return (
    <Tooltip text={tooltipText} placement={tooltipPosition}>
      <button
        className={`${rest.className ?? ""} ${isHoverableDisabled ? "" : styles["hover-button-container"]
          } ${label ? styles["button-container"] : styles["icon-only-button"]
          } ${isTransparent ? styles["background-transparent"] : label ? styles["background"] : styles["background-secondary"]}`}
        onClick={rest.onClick}
      >
        {icon && <Icon
          className={`material-symbols-outlined ${styling?.text} ${styles["icon"]
            } ${isTransparent ? styles["transparent-text-color"] : styles["background-text-color"]
            } ${styling?.hover}`}
        >
          {icon}
        </Icon>}
        {label && (
          <p className={`${styling?.text} ${styles["text"]} 
            ${isTransparent ? styles["transparent-text-color"] : styles["background-text-color"]} ${styling?.hover}`}>
            {label}
          </p>
        )}
      </button>
    </Tooltip>
  );
}
