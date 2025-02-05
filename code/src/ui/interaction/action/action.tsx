"use client";

import styles from "./action.module.css";
import React from "react";
import { Button, ButtonProps } from "antd";

interface ActionButtonProps extends ButtonProps {
  icon: string;
  useAntd?: boolean;
}

/**
 * A generic action button template that can use either custom styling or Ant Design.
 *
 * @param {string} icon The Material icon name.
 * @param {boolean} useAntd Optional flag to use Ant Design button (default: false)
 */
export default function ActionButton({
  icon,
  useAntd = false,
  className,
  title,
  children,
  ...rest
}: Readonly<ActionButtonProps>) {
  const iconElement = <span className="material-symbols-outlined">{icon}</span>;

  if (useAntd) {
    return (
      <Button {...rest} className={className} icon={iconElement}>
        {children || title}
      </Button>
    );
  }

  return (
    <button
      className={`${className} ${styles["button-container"]}`}
      onClick={rest.onClick}
    >
      {iconElement}
      <p className={styles["text"]}>{title}</p>
    </button>
  );
}
