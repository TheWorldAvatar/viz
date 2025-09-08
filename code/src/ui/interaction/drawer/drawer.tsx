import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import React from "react";
import { usePathname } from "next/navigation";
import { useDialog } from "hooks/float/useDialog";
import { useEffect, useRef } from "react";
import Button from "../button";

interface DrawerProps {
  isControlledOpen?: boolean;
  setIsControlledOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 *
 * @param {boolean} isControlledOpen Optional controlled state for showing/hiding the drawer.
 * @param  setIsControlledOpen Optional controlled dispatch state to show/hide drawer.
 * @param  onClose Optional function to be executed on close.
 */
export default function Drawer(props: Readonly<DrawerProps>) {
  const [isOpen, setIsOpen] = React.useState<boolean>(true);
  const dialog = useDialog(
    props.isControlledOpen ?? isOpen,
    props.setIsControlledOpen ?? setIsOpen,
    false
  );
  const transition = useTransitionStyles(dialog.context, {
    duration: 300,
    initial: {
      opacity: 0,
      transform: "translateX(3vh)",
      transitionProperty: "transform, opacity",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out",
    },
    open: {
      opacity: 1,
      transform: "translateX(0) translateY(0)",
      transitionProperty: "transform, opacity",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out",
    },
    close: {
      opacity: 0,
      transform: "translateX(3vh)",
      transitionProperty: "transform, opacity",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out",
    },
  });

  const currentPath = usePathname();
  const prevPathRef = useRef<string | null>(currentPath);

  useEffect(() => {
    if (prevPathRef.current !== currentPath) {
      setIsOpen(false);
      props.setIsControlledOpen?.(false);
    }
    prevPathRef.current = currentPath;
  }, [currentPath]);

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
                className="fixed right-0 top-0 bottom-0 flex items-end md:items-center md:justify-end pointer-events-none"
                {...dialog.getFloatingProps()}
              >
                <div
                  style={{
                    ...transition.styles,
                  }}
                  className="
                    relative bg-muted shadow-xl pointer-events-auto
                    w-full md:w-96 lg:w-4/9 xl:w-1/3 2xl:w-1/4
                    h-dvh md:h-full
                    rounded-t-lg md:rounded-t-none
                    md:border-l border-border
                    flex flex-col min-h-0
                  "
                >
                  <Button
                    leftIcon="close"
                    size="icon"
                    variant="ghost"
                    type="button"
                    className="absolute top-2 right-4 !rounded-full"
                    onClick={() => {
                      // Close the drawer on click
                      // Propagate to controlled state or default state
                      if (props.setIsControlledOpen) {
                        props.setIsControlledOpen(false);
                      } else {
                        setIsOpen(false);
                      }
                      // If there are additional close functions to execute
                      if (props.onClose) {
                        props.onClose();
                      }
                    }}
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
