"use client";

import { Icon } from "@mui/material";

import { toast as sonnerToast } from "sonner";
import Button from "ui/interaction/button";

interface ToastProps {
  id: string | number;
  title?: string;
  description?: string;
  type?: "success" | "error";
  duration?: number; // Duration in milliseconds, 0 for no auto-dismiss
  button: {
    label: string;
    onClick: () => void;
  };
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      duration={toast.duration}
      description={toast.description}
      type={toast.type}
      button={{
        label: toast.button.label,
        onClick: () => console.log("Button clicked"),
      }}
    />
  ));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, button, id, type } = props;

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
      className={`flex rounded-lg  shadow-lg  w-full md:max-w-[364px] items-center p-4 ${
        type === "error"
          ? " bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }  border`}
    >
      <div className="flex-shrink-0 mr-3">
        <Icon
          className={`material-symbols-outlined text-gray-900 ${
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
            {title}
          </p>
          <p
            className={`mt-1 text-sm text-gray-500 ${
              type === "success" ? " text-green-800" : "text-red-800"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      <div className="ml-5 shrink-0 rounded-md text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
        <Button
          variant="ghost"
          onClick={() => {
            button.onClick();
            sonnerToast.dismiss(id);
          }}
        >
          {button.label}
        </Button>
      </div>
    </div>
  );
}
