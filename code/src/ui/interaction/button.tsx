import React, { ButtonHTMLAttributes } from "react";
import { Placement } from "@floating-ui/react";
import { Icon } from "@mui/material";
import Tooltip from "ui/interaction/tooltip/tooltip";
import LoadingSpinner from "ui/graphic/loader/spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "link"
    | "primary"
    | "secondary"
    | "destructive"
    | "success"
    | "warning"
    | "outline"
    | "ghost"
    | "active";
  size?: "sm" | "md" | "lg" | "default" | "icon";
  leftIcon?: "string" | React.ReactNode;
  rightIcon?: "string" | React.ReactNode;
  loading?: boolean;
  label?: string;
  tooltipText?: string;
  tooltipPosition?: Placement;
  disabled?: boolean;
}

/**
 * A generic  button template class.
 *
 * @param {string} variant The button variant, e.g., "primary", "secondary", etc. This controls the button's appearance.
 * @param {string} size The button size, e.g., "sm", "md", "lg", "default", or "icon". This controls the button's dimensions and padding.
 * @param {string} spinnerSize The size of the loading spinner, e.g.,
 * @param {string} leftIcon Optional left icon, can be a string or React node.
 * @param {string} rightIcon Optional right icon, can be a string or React
 * @param {boolean} loading Optional loading state to show a spinner.
 * @param {string} label Optional label for the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {Placement} tooltipPosition Optional tooltip position.
 * @param {boolean} disabled Optional disabled state for the button.
 *
 */

export default function Button({
  className, // Allow custom classes to be passed in
  variant = "primary", // Default variant
  size = "md", // Default size
  onClick,
  leftIcon,
  rightIcon,
  children,
  disabled,
  loading = false, // Default loading state to false
  label,
  tooltipText,
  tooltipPosition = "top", // Default tooltip position
  ...props
}: Readonly<ButtonProps>) {
  // Base styles for the button, applied to all variants and sizes
  const baseStyles =
    "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

  // Define styles for each variant
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    link: "text-primary-foreground underline-offset-4 hover:underline",
    success:
      "bg-blue-300 hover:bg-blue-500/80 dark:bg-blue-800 dark:hover:bg-blue-900/80",
    warning:
      "bg-amber-300 hover:bg-amber-500/80 dark:bg-amber-800 dark:hover:bg-amber-900/80",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    destructive:
      "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline:
      "bg-transparent border border-border text-gray-700 hover:bg-gray-100",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-200",
    active:
      "bg-background border-1 border-border text-gray-800 hover:bg-gray-200 ",
  };

  // Define styles for each size
  const sizeStyles = {
    sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
    md: "px-4 py-2 text-base",
    default: "h-9 px-4 py-2 has-[>svg]:px-3",
    lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
    icon: "size-9",
  };

  // Define spacing between icons based on size
  const iconSpacing = {
    sm: "space-x-1",
    md: "space-x-1.5",
    default: "space-x-2",
    lg: "space-x-2",
    icon: "space-x-0",
  };

  // Define styles for the disabled state
  const disabledAndLoadingStyles = "opacity-50 cursor-not-allowed";

  // Build the className string
  const buttonClasses = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled || loading ? disabledAndLoadingStyles : "",
    className, // This allows for additional custom classes to be passed in
  ]
    .filter(Boolean) // Remove any empty strings (e.g., from the disabled conditional)
    .join(" "); // Join them into a single string

  return (
    <Tooltip text={tooltipText} placement={tooltipPosition}>
      <button
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={!disabled && !loading ? onClick : undefined}
        {...props}
      >
        <div className={`flex items-center ${iconSpacing[size]}`}>
          {loading && <LoadingSpinner isSmall={true} />}
          {!loading && leftIcon && (
            <span className="flex items-center">
              {<Icon className="material-symbols-outlined">{leftIcon}</Icon>}
            </span>
          )}
          <span>{children || label}</span>
          {!loading && rightIcon && (
            <span className="flex items-center">
              {<Icon className="material-symbols-outlined">{rightIcon}</Icon>}
            </span>
          )}
        </div>
      </button>
    </Tooltip>
  );
}
