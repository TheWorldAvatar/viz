"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Button, { ButtonProps } from "ui/interaction/button";


interface RedirectButtonProps extends ButtonProps {
  url: string;
  softRedirect?: boolean;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} url The redirect target url.
 * @param {boolean} softRedirect Performs a soft redirect using router.push().
 */
export default function RedirectButton({
  url,
  softRedirect = false,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (softRedirect) {
      // Use soft redirect to allow parallel routes to function
      router.push(url);
    } else {
      // Do not use router.push() as Next.js is unable to clear previous parallel routes, and forms will remain open
      window.location.href = url;
    }
  };
  return <Button {...rest} onClick={handleClick} />;
}
