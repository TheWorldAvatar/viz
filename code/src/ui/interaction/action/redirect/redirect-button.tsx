"use client";

import React from "react";
import Button, { ButtonProps } from "ui/interaction/button";


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
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    // Do not use router.push() as Next.js is unable to clear previous parallel routes, and forms will remain open
    window.location.href = url;
  };
  return <Button {...rest} onClick={handleClick} />;
}
