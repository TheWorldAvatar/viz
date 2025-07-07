"use client";

import React, { useEffect, useState } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { Icon } from "@mui/material";
import Button from "ui/interaction/button";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  isOpen: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export default function Toast({
  message,
  type = "info",
  duration = 4000,
  isOpen,
  setIsOpen,
  position = "bottom-right",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  const { refs, context } = useFloating({
    open: isVisible,
    onOpenChange: setIsVisible,
    middleware: [
      offset(10),
      flip({
        fallbackAxisSideDirection: "end",
      }),
      shift({ padding: 5 }),
    ],
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
    if (isOpen && duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  // Sync with parent state
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setIsOpen(false);
  };

  // Define toast styles based on type
  const getToastStyles = () => {
    const baseStyles = "flex items-center gap-3 p-4 rounded-lg shadow-xl border border-border min-w-80 max-w-md";
    
    switch (type) {
      case "success":
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case "error":
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case "info":
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
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
        className={`fixed z-50 ${getPositionStyles()}`}
        {...getFloatingProps()}
      >
        <div className={getToastStyles()}>
          <Icon className="material-symbols-outlined">{getIcon()}</Icon>
          <span className="flex-1 text-sm font-medium">{message}</span>
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

