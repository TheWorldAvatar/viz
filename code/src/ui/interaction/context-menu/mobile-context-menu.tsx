import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useTransitionStyles,
} from "@floating-ui/react";
import React from "react";
import { useState } from "react";

import { useDialog } from "hooks/float/useDialog";

import Button from "../button";
import ContextMenu from "./context-menu";

interface DrawerProps {
    isExternalOpen?: boolean;
    setIsExternalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    onClose?: () => void;
    children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 * This component is entirely controlled by Redux state.
 *
 * @param onClose Optional function to be executed on close.
 * @param isExternalOpen Optional external control for the open state.
 * @param setIsExternalOpen Optional external setter for the open state.
 */
export default function MobileContextMenu(props: Readonly<DrawerProps>) {
    const [isOpen, setIsOpen] = useState(props.isExternalOpen ?? false);
    const dialog = useDialog(props.isExternalOpen ?? isOpen, props.setIsExternalOpen ?? setIsOpen, true, props.onClose);
    const transition = useTransitionStyles(dialog.context, {
        duration: 300,
        initial: {
            opacity: 0,
            transform: "translateY(3vh)", // start below
            transitionProperty: "transform, opacity",
            transitionDuration: "300ms",
            transitionTimingFunction: "ease-out",
        },
        open: {
            opacity: 1,
            transform: "translateY(0)",
            transitionProperty: "transform, opacity",
            transitionDuration: "300ms",
            transitionTimingFunction: "ease-out",
        },
        close: {
            opacity: 0,
            transform: "translateY(3vh)",
            transitionProperty: "transform, opacity",
            transitionDuration: "300ms",
            transitionTimingFunction: "ease-out",
        },
    });

    return (
        <>
            {dialog.open && (
                <FloatingPortal>
                    <FloatingOverlay className="z-[999] pointer-events-none">
                        <FloatingFocusManager context={dialog.context}>
                            <div
                                ref={dialog.refs.setFloating}
                                style={{
                                    ...dialog.floatingStyles,
                                    zIndex: 999998,
                                }}
                                className="fixed left-0 right-0 bottom-0 flex items-end "
                                {...dialog.getFloatingProps()}
                            >
                                <div
                                    style={{
                                        ...transition.styles,
                                    }}
                                    className="relative bg-muted shadow-xl pointer-events-auto w-full max-h-16 rounded-t-3xl border border-border border-b-0 border-l-0 border-r-0 flex flex-col min-h-42"
                                >
                                    <Button
                                        leftIcon="close"
                                        size="icon"
                                        variant="ghost"
                                        type="button"
                                        className="absolute top-2 right-4 !rounded-full"
                                        onClick={() => dialog.setIsOpen(false)}
                                    />
                                    <div className="px-4 h-full flex flex-col min-h-0">
                                        {props.children}
                                    </div>
                                </div>
                            </div>
                        </FloatingFocusManager>
                    </FloatingOverlay>
                </FloatingPortal>
            )}
        </>
    );
}
