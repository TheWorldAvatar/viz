"use client";

import Button, { ButtonProps } from "ui/interaction/button";
import { getSafeUrl } from "utils/internal-api-services";

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
  const safeHref: string | null = getSafeUrl(url);
  if (!safeHref) {
    // If the URL is not considered safe, render a non-link button
    return <Button {...rest} />;
  }
  return <a target="_blank" href={safeHref} rel="noopener noreferrer">
    <Button {...rest} />
  </a>;
}
