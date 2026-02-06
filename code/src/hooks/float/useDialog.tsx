import {
  autoUpdate,
  ElementProps,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  UseInteractionsReturn,
  useRole,
} from "@floating-ui/react";
import React from "react";

export function useDialog(
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  dismissOutsidePress: boolean = true,
  onClose?: () => void
) {
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open && onClose) {
        onClose();
      }
    },
    [setIsOpen, onClose]
  );

  const floatingProps = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    whileElementsMounted: autoUpdate,
  });

  const context = floatingProps.context;
  const hover: ElementProps = useClick(context);
  const dismiss: ElementProps = useDismiss(context, {
    escapeKey: true,
    outsidePress: dismissOutsidePress,
  });
  const role: ElementProps = useRole(context);

  const interactions: UseInteractionsReturn = useInteractions([
    hover,
    dismiss,
    role,
  ]);

  return React.useMemo(
    () => ({
      open: isOpen,
      setIsOpen: handleOpenChange,
      context,
      ...interactions,
      ...floatingProps,
    }),
    [isOpen, handleOpenChange, context, interactions, floatingProps]
  );
}
