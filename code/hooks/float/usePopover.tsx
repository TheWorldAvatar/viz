import { autoUpdate, ElementProps, flip, offset, Placement, shift, useClick, useDismiss, useFloating, useFocus, useInteractions, UseInteractionsReturn, useRole } from "@floating-ui/react";
import React, { useState } from "react";

export function usePopover(
    placement: Placement = "top",
    isControlledOpen?: boolean,
    setIsControlledOpen?: React.Dispatch<React.SetStateAction<boolean>>,
    onClose?: () => void,) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        setIsControlledOpen?.(open);
        if (!open) {
            onClose?.();
        }
    };

    const floatingProps = useFloating({
        placement: placement,
        open: isControlledOpen ?? isOpen,
        onOpenChange: handleOpenChange,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(8),
            flip(),
            shift()
        ]
    });

    const context = floatingProps.context;
    const click = useClick(context);
    const focus: ElementProps = useFocus(context);
    const dismiss: ElementProps = useDismiss(context);
    const role: ElementProps = useRole(context);

    const interactions: UseInteractionsReturn = useInteractions([click, focus, dismiss, role]);

    return React.useMemo(
        () => ({
            isOpen: isControlledOpen ?? isOpen,
            setIsOpen: handleOpenChange,
            context,
            ...interactions,
            ...floatingProps
        }),
        [isOpen, setIsOpen, context, interactions, floatingProps]
    );
}