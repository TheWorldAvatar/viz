import { autoUpdate, ElementProps, flip, offset, Placement, shift, useDismiss, useFloating, useFocus, useHover, useInteractions, UseInteractionsReturn, useRole } from "@floating-ui/react";
import React, { useState } from "react";


export function useTooltip(placement: Placement = "top") {
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
    const hover: ElementProps = useHover(context, {
        move: false,
    });
    const focus: ElementProps = useFocus(context);
    const dismiss: ElementProps = useDismiss(context);
    const role: ElementProps = useRole(context, { role: "tooltip" });

    const interactions: UseInteractionsReturn = useInteractions([hover, focus, dismiss, role]);

    return React.useMemo(
        () => ({
            isOpen,
            context,
            ...interactions,
            ...floatingProps
        }),
        [isOpen, context, interactions, floatingProps]
    );
}