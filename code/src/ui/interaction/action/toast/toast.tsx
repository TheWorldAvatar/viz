"use client";

import { useEffect, useState } from "react";
import {
  useFloating,
  autoUpdate,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { Icon } from "@mui/material";
import Button from "ui/interaction/button";
import { AgentResponseBody } from "types/backend-agent";

interface ToastProps {
  response: AgentResponseBody;
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export default function Toast({
  response,
  duration = 4000,
  position = "bottom-right",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const toastType: "success" | "error" = response?.error ? "error" : "success";

  const { refs, context } = useFloating({
    open: isVisible,
    onOpenChange: setIsVisible,
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: false,
  });
  const role = useRole(context);

  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  // Auto-close timer
  useEffect(() => {
    if (toastType !== "error" && duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Sync with parent state
  // useEffect(() => {
  //   setIsVisible(isOpen);
  // }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Define toast styles based on type
  const getToastStyles = () => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-xl border border-border min-w-48 md:min-w-80 max-w-xs md:max-w-md";

    switch (toastType) {
      case "success":
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case "error":
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (toastType) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "bottom-4 right-4";
    }
  };

  if (!isVisible) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        className={`fixed z-[9999] ${getPositionStyles()}`}
        {...getFloatingProps()}
      >
        <div className={getToastStyles()}>
          <Icon className="material-symbols-outlined">{getIcon()}</Icon>
          <span className="flex-1 text-sm font-medium">
            {response?.data?.message || response?.error?.message}
          </span>
          <Button
            leftIcon="close"
            size="icon"
            variant="ghost"
            className="!rounded-full dark:!text-black dark:hover:!text-white"
            onClick={handleClose}
            aria-label="Close toast"
          />
        </div>
      </div>
    </FloatingPortal>
  );
}
