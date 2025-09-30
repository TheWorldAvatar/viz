"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import Button, { ButtonProps } from "ui/interaction/button";
import { closeDrawer } from "state/drawer-component-slice";

interface RedirectButtonProps extends ButtonProps {
  url: string;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} url The redirect target url.
 */
export default function RedirectButton({
  url,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    dispatch(closeDrawer());
    router.push(url);
  };
  return <Button {...rest} onClick={handleClick} />;
}
