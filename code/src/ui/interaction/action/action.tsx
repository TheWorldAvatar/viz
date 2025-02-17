"use client";

import styles from './action.module.css';

import React from 'react';
import { Icon } from '@mui/material';

export interface ActionButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: string;
  isHoverableDisabled?: boolean;
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
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {string} styling.active Unused in this button.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ActionButton({ icon, isHoverableDisabled, styling, ...rest }: Readonly<ActionButtonProps>) {
  return (
    <button className={`${rest.className} ${styles["button-container"]} ${isHoverableDisabled ? "" : styles["hover-button-container"]}`} onClick={rest.onClick}>
      <Icon className={`material-symbols-outlined ${styles["icon"]} ${styling?.hover} ${styling?.text}`}>{icon}</Icon>
      <p className={`${styles["text"]} ${styling?.hover} ${styling?.text}`}>{rest.title}</p>
    </button>
  );
}