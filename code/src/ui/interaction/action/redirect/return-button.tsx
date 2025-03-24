"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { getIsOpenState, setIsOpen } from "state/modal-slice";
import ActionButton, { ActionButtonProps } from "../action";

/**
 * An action button that redirects to the target url.
 *
 * @param {string} icon The Material icon name.
 * @param {boolean} isHoverableDisabled An optional parameter to disable hovering effects.
 * @param {boolean} isTransparent An optional parameter to create a transparent icon button.
 * @param {string} styling.active An optional styling object for the active state when active.
 * @param {string} styling.hover An optional styling object for hover effects on text and icon.
 * @param {string} styling.text An optional styling object for text and icon.
 */
export default function ReturnButton({
  icon,
  label,
  isHoverableDisabled,
  isTransparent,
  styling,
  ...rest
}: Readonly<ActionButtonProps>) {
  const router = useRouter();
  const isOpen: boolean = useSelector(getIsOpenState);
  const dispatch = useDispatch();

  const handleReturnClick: React.MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (isOpen) {
      dispatch(setIsOpen(false));
    }
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
      isTransparent={isTransparent}
      styling={styling}
    />
  );
}
