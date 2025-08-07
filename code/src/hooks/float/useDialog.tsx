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
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const floatingProps = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });

  const context = floatingProps.context;
  const hover: ElementProps = useClick(context);
  const dismiss: ElementProps = useDismiss(context, {
    escapeKey: true,
    outsidePress: false,
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
      setIsOpen,
      context,
      ...interactions,
      ...floatingProps,
    }),
    [isOpen, setIsOpen, context, interactions, floatingProps]
  );
}
