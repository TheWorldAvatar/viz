"use client";

import { ButtonProps, buttonVariants } from "@/ui/interaction/button";
import { getSafeUrl } from "@/utils/internal-api-services";
import { AnchorHTMLAttributes } from "react";

interface ExternalRedirectButtonProps extends
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">,
  Pick<ButtonProps, "variant" | "size" | "label"> {
  url: string;
}

/**
 * A link that looks like a button and redirects to the target external url in a new tab.
 * Links keep their own semantics, so this styles an `<a>` with buttonVariants rather than
 * rendering a Button, as Base UI recommends.
 *
 * @param {string} url The target url.
 * @param {string} variant Optional button variant, e.g., "primary", "secondary", etc. Defaults to "primary".
 * @param {string} size Optional button size, e.g., "xs", "sm", "default" or "lg". Defaults to "default".
 * @param {string} label Optional label for the link, used when no children are given.
 */
export default function ExternalRedirectButton({
  url,
  className,
  variant,
  size,
  label,
  children,
  ...rest
}: Readonly<ExternalRedirectButtonProps>) {
  const safeHref: string | null = getSafeUrl(url);
  if (!safeHref) {
    // If the URL is not considered safe, warn and do nothing
    console.warn("Unsafe URL blocked!")
    return <></>;
  }
  return (
    <a
      {...rest}
      target="_blank"
      href={safeHref}
      rel="noopener noreferrer"
      className={buttonVariants({ variant, size, className })}
    >
      {children ?? label}
    </a>
  );
}
