"use client";

import { Icon } from "@mui/material";
import { toast as sonnerToast } from "sonner";
import { useDictionary } from "@/hooks/useDictionary";
import { Dictionary } from "@/types/dictionary";
import Button from "@/ui/interaction/button";
import { ToastConfig, ToastType } from "@/types/toast";
import { getToastConfig } from "@/utils/client-utils";

interface ToastProps {
  id: string | number;
  message?: string;
  type?: ToastType;
}

/**
 * Sets off a toast notification based on the message and type.
 *
 * @param {string} message - The message to display in the toast.
 * @param {ToastType} type- The type of toast (success, error, or loading).
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
 * @param {string | number} id - The ID of the toast to dismiss.
 */
toast.dismiss = (id: number | string) => {
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
  const toastConfig: ToastConfig = getToastConfig(type, dict);

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg border p-3 shadow-xl sm:gap-3 sm:p-4 md:w-125 ${toastConfig.bg} ${toastConfig.text} ${toastConfig.border}`}
    >
      <Icon
        className={`material-symbols-outlined shrink-0 mr-1 ${toastConfig.animate} ${toastConfig.text}`}
      >
        {toastConfig.icon}
      </Icon>
      <div className="min-w-0 flex-1">
        {toastConfig.title && (
          <p className={`text-sm font-medium ${toastConfig.text}`}>
            {toastConfig.title}
          </p>
        )}
        <p
          className={`text-sm hyphens-auto wrap-break-word ${toastConfig.text} ${toastConfig.title ? "mt-1" : ""}`}
        >
          {message}
        </p>
      </div>
      {type !== "loading" &&
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 shrink-0 ${toastConfig.text}`}
          leftIcon="close"
          iconSize="small"
          aria-label={dict.action.dismiss}
          tooltipText={dict.action.dismiss}
          onClick={() => {
            toast.dismiss(id);
          }}
        />}
    </div>
  );
}
