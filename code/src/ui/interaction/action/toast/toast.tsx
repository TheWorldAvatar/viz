"use client";

import { Icon } from "@mui/material";
import { toast as sonnerToast } from "sonner";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";

interface ToastProps {
  id: string | number;
  message?: string;
  type?: "success" | "error";
}

/**
 * Sets off a toast notification based on the message and type.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} type- The type of toast (success or error).
 */
export function toast(message: string, type: "success" | "error") {
  return sonnerToast.custom(
    (id) => <Toast id={id} message={message} type={type} />,
    { duration: type === "error" ? 1000000000 : 5000 }
  );
}

/**
 * This component is used to display toast notifications.
 *
 * @param {string | number} id - The unique identifier for the toast.
 * @param {string} message - The message to display in the toast.
 * @param {string} type- The type of toast (success or error).
 */
function Toast(props: Readonly<ToastProps>) {
  const { message, id, type } = props;
  const dict: Dictionary = useDictionary();

  // Function to get the appropriate icon name
  const getIcon = () => {
    switch (type) {
      case "success":
        return "check_circle";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <div
      className={`flex rounded-lg  shadow-xl gap-3  w-full md:w-[500px] items-center justify-center p-4 ${
        type === "error"
          ? " bg-status-error-bg border-red-200"
          : "bg-status-success-bg border-green-200"
      }  border`}
    >
      <div className="flex-shrink-0 mr-3">
        <Icon
          className={`material-symbols-outlined text-gray-900 flex-shrink-0 mt-0.5  ${
            type === "success"
              ? " text-status-success-text"
              : "text-status-error-text"
          }`}
        >
          {getIcon()}
        </Icon>
      </div>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p
            className={`text-sm font-medium text-gray-900 ${
              type === "success"
                ? " text-status-success-text"
                : "text-status-error-text"
            }`}
          >
            {type === "success" ? dict.title.success : dict.title.error}
          </p>
          <p
            className={`mt-1 text-sm text-gray-500 ${
              type === "success"
                ? " text-status-success-text"
                : "text-status-error-text"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
      <div className="ml-5 shrink-0">
        <Button
          variant="ghost"
          className="dark:!text-gray-300 dark:hover:!text-white transition-colors ease-linear duration-200 "
          onClick={() => {
            sonnerToast.dismiss(id);
          }}
        >
          {dict.action.dismiss}
        </Button>
      </div>
    </div>
  );
}
