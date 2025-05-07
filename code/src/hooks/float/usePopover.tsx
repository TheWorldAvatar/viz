import { autoUpdate, ElementProps, flip, offset, Placement, shift, useClick, useDismiss, useFloating, useFocus, useInteractions, UseInteractionsReturn, useRole } from "@floating-ui/react";
import React, { useState } from "react";

export function usePopover(placement: Placement = "top") {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const floatingProps = useFloating({
        placement: placement,
        open: isOpen,
        onOpenChange: setIsOpen,
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
            isOpen,
            setIsOpen,
            context,
            ...interactions,
            ...floatingProps
        }),
        [isOpen, setIsOpen, context, interactions, floatingProps]
    );
}