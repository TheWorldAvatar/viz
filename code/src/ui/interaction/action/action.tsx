"use client";

import styles from "./action.module.css";

import React from "react";
import { Icon } from "@mui/material";

export interface ActionButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string
  isHoverableDisabled?: boolean;
  isTransparent?: boolean;
  styling?: ActionStyles;
}

export interface ActionStyles {
  active?: string;
  hover?: string;
  text?: string;
}

/**
 * A generic action button template class.
 *
 * @param {string} icon The Material icon name.
 * @param {string} label Optional label that is displayed on the button.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.active Unused in this button.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ActionButton({
  icon,
  label,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<ActionButtonProps>) {
  return (
    <button
      className={`${rest.className ?? ""} ${isHoverableDisabled ? "" : styles["hover-button-container"]
        } ${label ? styles["button-container"] : styles["icon-only-button"]
        } ${isTransparent ? styles["background-transparent"] : label ? styles["background"] : styles["background-secondary"]}`}
      onClick={rest.onClick}
    >
      <Icon
        className={`material-symbols-outlined ${styles["icon"]
          } ${isTransparent ? styles["transparent-text-color"] : styles["background-text-color"]
          } ${styling?.hover} ${styling?.text}`}
      >
        {icon}
      </Icon>
      {label && (
        <p className={`${styles["text"]
          } ${isTransparent ? styles["transparent-text-color"] : styles["background-text-color"]
          } ${styling?.hover} ${styling?.text}`}>
          {label}
        </p>
      )}
    </button>
  );
}
