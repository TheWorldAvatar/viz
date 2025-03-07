"use client";

import styles from "../action.module.css";

import React from "react";
import { useRouter } from "next/navigation";

import ActionButton, { ActionButtonProps, ActionStyles } from "../action";

interface RedirectButtonProps extends ActionButtonProps {
  url: string;
  isActive: boolean;
  styling?: ActionStyles;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} icon The Material icon name.
 * @param {string} url The redirect target url.
 * @param {boolean} isActive Indicates if the redirect button is active and should be highlighted.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {string} styling.active An optional styling object for the active state when active.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function RedirectButton({
  icon,
  label,
  url,
  isActive,
  isHoverableDisabled,
  styling,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    router.push(url);
  };
  return (
    <ActionButton
      icon={icon}
      label={label}
      className={`${isActive ? styling?.active ?? styles["active"] : ""} ${rest.className
        }`}
      title={rest.title}
      onClick={handleClick}
      isHoverableDisabled={isHoverableDisabled}
      styling={styling}
    />
  );
}
