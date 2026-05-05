import Button from "ui/interaction/button";

export interface RowActionButtonProps {
  icon: string;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

/**
 * A generic row action button template.
 *
 * @param {string} icon Display icon.
 * @param {string} label Aria-label for the button.
 * @param onClick Click handler for the button.
 * @param {boolean} disabled Optional disabled state for the button.
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
  />
}
