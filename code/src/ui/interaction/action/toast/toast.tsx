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
  duration?: number;
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom(
    (id) => <Toast id={id} message={toast.message} type={toast.type} />,
    { duration: toast.duration || 4000 } // Default duration if not provided
  );
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
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
          ? " bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }  border`}
    >
      <div className="flex-shrink-0 mr-3">
        <Icon
          className={`material-symbols-outlined text-gray-900 flex-shrink-0 mt-0.5  ${
            type === "success" ? " text-green-800" : "text-red-800"
          }`}
        >
          {getIcon()}
        </Icon>
      </div>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p
            className={`text-sm font-medium text-gray-900 ${
              type === "success" ? " text-green-800" : "text-red-800"
            }`}
          >
            {type === "success" ? dict.title.success : dict.title.error}
          </p>
          <p
            className={`mt-1 text-sm text-gray-500 ${
              type === "success" ? " text-green-800" : "text-red-800"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
      <div className="ml-5 shrink-0">
        <Button
          variant="ghost"
          className="dark:!text-black dark:hover:!text-white"
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
