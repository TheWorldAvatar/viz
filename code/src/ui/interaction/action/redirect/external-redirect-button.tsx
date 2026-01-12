"use client";

import Button, { ButtonProps } from "ui/interaction/button";

interface ExternalRedirectButtonProps extends ButtonProps {
  url: string;
}

/**
 * An action button that redirects to the target external url in a new tab.
 *
 * @param {string} url The target url.
 */
export default function ExternalRedirectButton({
  url,
  ...rest
}: Readonly<ExternalRedirectButtonProps>) {
  return <a target="_blank" href={url} rel="noopener noreferrer">
    <Button {...rest} />
  </a>;
}
