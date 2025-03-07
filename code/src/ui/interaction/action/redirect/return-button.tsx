"use client";

import styles from "../action.module.css";

import React from "react";
import { useRouter } from "next/navigation";

import ActionButton, { ActionButtonProps, ActionStyles } from "../action";

interface RedirectButtonProps extends ActionButtonProps {
  styling?: ActionStyles;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} icon The Material icon name.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {string} styling.active An optional styling object for the active state when active.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ReturnButton({
  icon,
  label,
  isHoverableDisabled,
  styling,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const handleReturnClick: React.MouseEventHandler<HTMLButtonElement> = (): void => {
    router.back();
  };
  return (
    <ActionButton
      icon={icon}
      label={label}
      className={rest.className}
      title={rest.title}
      onClick={handleReturnClick}
      isHoverableDisabled={isHoverableDisabled}
      styling={styling}
    />
  );
}
