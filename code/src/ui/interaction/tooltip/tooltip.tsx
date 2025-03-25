import styles from './tooltip.module.css';

import React, { useState } from "react";
import { autoUpdate, flip, FloatingPortal, offset, shift, useFloating, useHover, useInteractions } from "@floating-ui/react";

export interface TooltipProps {
    text: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function useTooltip(text?: string) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen && !!text,
        onOpenChange: setIsOpen,
        middleware: [offset(8), flip(), shift()],
        whileElementsMounted: autoUpdate,
        placement: "top"
    });

    const hover = useHover(context, {
        enabled: !!text,
        move: false
    });

    const { getReferenceProps } = useInteractions([hover]);

    return {
        isOpen,
        refs,
        floatingStyles,
        getReferenceProps,
        text
    };
}

export function renderTooltip(tooltipProps: ReturnType<typeof useTooltip>) {
    const { isOpen, refs, floatingStyles, text } = tooltipProps;

    if (!isOpen || !text) return null;

    return (
        <FloatingPortal>
            <div
                ref={refs.setFloating}
                style={{
                    ...floatingStyles,
                    zIndex: 999999 // Highest z-index so it is above modal content
                }}
                className={styles.tooltip}
            >
                {text}
            </div>
        </FloatingPortal >
    );
}