"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    router.push(url);
  };
  return <Button {...rest} onClick={handleClick} />;
}
