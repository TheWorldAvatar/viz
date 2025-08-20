"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button, { ButtonProps } from "ui/interaction/button";

interface RedirectButtonProps extends ButtonProps {
  url: string;
  additionalHandleClickFunction?: () => void;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} url The redirect target url.
 * @param additionalHandleClickFunction Optional function to execute on click.
 */
export default function RedirectButton({
  url,
  additionalHandleClickFunction,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    if (additionalHandleClickFunction) {
      additionalHandleClickFunction();
    }
    event.preventDefault();
    router.push(url);
  };
  return <Button {...rest} onClick={handleClick} />;
}
