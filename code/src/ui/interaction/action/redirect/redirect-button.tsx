"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Button, { ButtonProps } from "ui/interaction/button";
import { setFormPersistenceEnabled, setOpenFormCount, selectOpenFormCount } from "state/form-persistence-slice";
import { useDispatch, useSelector } from "react-redux";


interface RedirectButtonProps extends ButtonProps {
  url: string;
  softRedirect?: boolean;
  saveFormDataInMemory?: boolean;
}

/**
 * An action button that redirects to the target url.
 *
 * @param {string} url The redirect target url.
 * @param {boolean} softRedirect Performs a soft redirect using router.push().
 * @param {boolean} saveFormDataInMemory Saves form data in memory.
 */
export default function RedirectButton({
  url,
  softRedirect = false,
  saveFormDataInMemory = false,
  ...rest
}: Readonly<RedirectButtonProps>) {
  const router = useRouter();
  const dispatch = useDispatch();
  const openFormCount: number = useSelector(selectOpenFormCount);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (softRedirect) {
      // Use soft redirect to allow parallel routes to function
      router.push(url);
    } else if (saveFormDataInMemory) {
      // Use soft redirect to allow parallel routes to function and save form data in memory
      router.push(url);
      dispatch(setOpenFormCount(openFormCount + 1));
      dispatch(setFormPersistenceEnabled(true));
      // Clear the form data save flag after 300ms
      setTimeout(() => {
        dispatch(setFormPersistenceEnabled(false));
      }, 300);
    } else {
      // Do not use router.push() as Next.js is unable to clear previous parallel routes, and forms will remain open
      window.location.href = url;
    }
  };
  return <Button {...rest} onClick={handleClick} />;
}
