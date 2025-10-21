"use client";

import { Icon } from "@mui/material";
import { toast as sonnerToast } from "sonner";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import Button from "ui/interaction/button";
import { ToastType } from "types/toast";
import { getToastConfig } from "utils/client-utils";


interface ToastProps {
  id: string | number;
  message?: string;
  type?: ToastType;
}

/**
 * Sets off a toast notification based on the message and type.
 *
 * @param {string} message - The message to display in the toast.
 * @param {string} type- The type of toast (success, error, or loading).
 */
export function toast(message: string, type: ToastType) {
  return sonnerToast.custom(
    (id) => <Toast id={id} message={message} type={type} />,
    { duration: type === "error" || type === "loading" ? 1000000000 : 5000 }
  );
}

/**
 * Dismisses a toast notification by ID.
 *
 * @param {string | number | null} id - The ID of the toast to dismiss.
 */
toast.dismiss = (id?: number | string) => {
  sonnerToast.dismiss(id);
};

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
  const statusStyles = getToastConfig(type, dict);

  return (
    <div
      className={`flex rounded-lg shadow-xl gap-3 w-full md:w-[500px] items-center justify-center p-4 ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}
        border`}
    >
      <div className="flex-shrink-0 mr-3">
        <Icon
          className={`material-symbols-outlined flex-shrink-0 mt-0.5 ${statusStyles.animate} ${statusStyles.text}`}
        >
          {statusStyles.icon}
        </Icon>
      </div>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p
            className={`text-sm font-medium ${statusStyles.text}`}
          >
            {statusStyles.title}
          </p>
          <p
            className={`mt-1 text-sm ${statusStyles.text}`}
          >
            {message}
          </p>
        </div>
      </div>
      {type !== "loading" &&
        <div className="ml-5 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              sonnerToast.dismiss(id);
            }}
          >
            {dict.action.dismiss}
          </Button>
        </div>}
    </div>
  );
}
