"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import LoadingSpinner from "@/ui/graphic/loader/spinner";
import Tooltip, { TooltipProps } from "@/ui/interaction/tooltip/tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import React from "react";

/**
 * Builds the button class string for a variant and size. Exported so that elements with
 * their own semantics (e.g. links) can look like a button without being rendered through
 * the Button component, as Base UI recommends.
 */
export const buttonVariants = cva(
  "cursor-pointer inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap outline-none select-none transition-all duration-100 ease-linear focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-zinc-400 data-disabled:pointer-events-none data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary border border-transparent text-primary-foreground hover:bg-primary/80",
        secondary: "bg-gray-200 border border-transparent text-gray-800 hover:bg-gray-300",
        outline: "bg-transparent border border-border text-foreground hover:bg-gray-200 dark:hover:text-background",
        ghost: "border border-transparent text-foreground hover:bg-gray-300 dark:hover:bg-zinc-700",
        link: "text-blue-500 underline-offset-4 hover:underline",
        destructive: "bg-destructive/10 border border-transparent text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 ",
        info: "text-white border border-transparent bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600",
        info_banner: "bg-info-background border border-info-border text-info-foreground shadow-xs hover:bg-info-background-hover",
        active: "bg-background border border-border text-gray-800 hover:bg-gray-200 dark:bg-muted dark:text-foreground dark:hover:bg-zinc-900",
      },
      size: {
        xs: "h-7 gap-1 px-2 has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-8 gap-1.5 px-3 has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5 [&_svg:not([class*='size-'])]:size-5",
        default: "h-10 gap-1.5 px-4 text-base has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3 [&_svg:not([class*='size-'])]:size-5",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

// cva also allows `null` for a variant (meaning "use the default"); only the named keys
// are exposed so callers get a real value back
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps extends Omit<ButtonPrimitive.Props, "className" | "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  label?: string;
  hasMobileIcon?: boolean;
  tooltipText?: string;
  tooltipSide?: TooltipProps["side"];
  tooltipAlign?: TooltipProps["align"];
  tooltipDisableHoverablePopup?: TooltipProps["disableHoverablePopup"];
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * A generic button template class built on the Base UI Button, which supplies the
 * button semantics, `type="button"` default, disabled handling and the `render` prop.
 *
 * @param {string} variant The button variant, e.g., "primary", "secondary", "outline", etc. This controls the button's appearance. Defaults to "primary".
 * @param {string} size The button size, e.g., "xs", "sm", "default", "lg" or "icon". This controls the button's dimensions and padding. Defaults to "default".
 * @param {LucideIcon} leftIcon Optional lucide icon component rendered before the label.
 * @param {LucideIcon} rightIcon Optional lucide icon component rendered after the label.
 * @param {boolean} loading Optional loading state to show a spinner.
 * @param {string} label Optional label for the button.
 * @param {string} tooltipText Optional label that is displayed as a tooltip on hover.
 * @param {string} tooltipSide Optional side of the button to show the tooltip on: "top", "bottom", "left" or "right". Defaults to "top".
 * @param {string} tooltipAlign Optional alignment along that side: "start", "center" or "end".
 * @param {boolean} tooltipDisableHoverablePopup Optional flag for whether the tooltip contents can be hovered without closing the tooltip.
 * @param {boolean} disabled Optional disabled state for the button.
 * @param {boolean} hasMobileIcon if set to false, the button will not show icons on mobile devices.
 */
export default function Button({
  className, // Allow custom classes to be passed in
  variant, // Defaults are owned by buttonVariants
  size, // Defaults are owned by buttonVariants
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  disabled,
  loading = false, // Default loading state to false
  label,
  tooltipText,
  tooltipSide = "top", // Default tooltip side
  tooltipAlign,
  hasMobileIcon = true,
  ref,
  tooltipDisableHoverablePopup,
  ...props
}: Readonly<ButtonProps>) {

  const isInactive: boolean = disabled || loading;
  const iconWrapperClasses: string = `${hasMobileIcon ? "flex" : "hidden md:flex"} items-center`;

  const button: React.ReactElement = (
    // Base UI blocks click and key handlers itself while disabled, so onClick is passed as-is.
    // focusableWhenDisabled keeps focus on the button while it is loading
    <ButtonPrimitive
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={isInactive}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span data-icon="inline-start" className="flex items-center">
          <LoadingSpinner size="sm" />
        </span>
      )}
      {!loading && LeftIcon && (
        <span data-icon="inline-start" className={iconWrapperClasses}>
          <LeftIcon aria-hidden />
        </span>
      )}
      <span className="truncate">{children || label}</span>
      {!loading && RightIcon && (
        <span data-icon="inline-end" className={iconWrapperClasses}>
          <RightIcon aria-hidden />
        </span>
      )}
    </ButtonPrimitive>
  );

  if (!tooltipText) {
    return button;
  }

  return (
    // A disabled button emits no pointer events, so the tooltip is anchored to a wrapper
    // instead so that it can still be displayed. Base UI binds its hover listeners to the
    // trigger element once, so the tooltip must remount when the trigger swaps between
    // the wrapper and the bare button
    <Tooltip key={`${isInactive}`} text={tooltipText} side={tooltipSide} align={tooltipAlign} disableHoverablePopup={tooltipDisableHoverablePopup}>
      {isInactive ? <span className="inline-flex">{button}</span> : button}
    </Tooltip>
  );
}
