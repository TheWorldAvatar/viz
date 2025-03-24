import { useFloating, autoUpdate, offset, flip, shift, useHover, useInteractions, FloatingPortal } from "@floating-ui/react";
import React, { useState, useRef } from "react";
import styles from './tooltip.module.css';

export interface TooltipProps {
    text: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function useTooltip(text?: string) {
    const [isOpen, setIsOpen] = useState(false);

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