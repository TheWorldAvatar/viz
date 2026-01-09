"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import Button, { ButtonProps } from "ui/interaction/button";
import { triggerDrawerClose, resetDrawerCount } from "state/drawer-signal-slice";


interface RedirectButtonProps extends ButtonProps {
  url: string;
  closeModal?: boolean;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} url The redirect target url.
 */
export default function RedirectButton({
  url,
  closeModal = true,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (closeModal) {
      dispatch(triggerDrawerClose());
      dispatch(resetDrawerCount());
    }
    router.push(url);
  };
  return <Button {...rest} onClick={handleClick} />;
}
