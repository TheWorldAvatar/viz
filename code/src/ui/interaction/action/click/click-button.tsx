"use client";

import styles from '../action.module.css';

import React from 'react';

import ActionButton from '../action';

interface ClickActionButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: string;
  isActive?: boolean;
}

/**
 * A clickable button that performs the target action when a click mouse event is triggered.
 * Please ensure a onClick parameter is included.
 * 
 * @param {string} icon The Material icon name.
 * @param {boolean} isActive Optional indicator to put the button in an active state if true.
 */
export default function ClickActionButton({ icon, isActive, ...rest }: Readonly<ClickActionButtonProps>) {
  return (
    <ActionButton
      icon={icon}
      className={`${isActive ? styles["active"] : ""} ${rest.className}`}
      title={rest.title}
      onClick={rest.onClick}
    />
  );
}