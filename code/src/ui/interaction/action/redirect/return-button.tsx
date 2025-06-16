"use client";

import { useRouter } from "next/navigation";
import React from "react";

import Button, { ButtonProps } from "ui/interaction/button";

export default function ReturnButton({ ...rest }: Readonly<ButtonProps>) {
  const router = useRouter();

  const handleReturnClick: React.MouseEventHandler<HTMLButtonElement> = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    router.back();
  };
  return <Button {...rest} onClick={handleReturnClick} />;
}
