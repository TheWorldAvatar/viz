import Button from "@/ui/interaction/button";
import { MouseEventHandler, ReactNode } from "react";

export interface RowActionButtonProps {
  icon: string;
  label?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A generic row action button template.
 *
 * @param {string} icon Display icon.
 * @param {string} label Optional text content, and only rendered when there are no children.
 * @param onClick Click handler for the button.
 * @param {boolean} disabled Optional disabled state for the button.
 * @param {ReactNode} children Optional content that takes precedence over the label when provided.
 */
export default function RowActionButton(props: Readonly<RowActionButtonProps>) {
  return <Button
    variant="ghost"
    size="md"
    iconSize="medium"
    className="w-full justify-start"
    leftIcon={props.icon}
    label={props.label}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </Button>
}
