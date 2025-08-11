import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import React, { useEffect, useRef } from "react";

import { useDialog } from "hooks/float/useDialog";
import { useDictionary } from "hooks/useDictionary";
import { Dictionary } from "types/dictionary";
import { usePathname } from "next/navigation";
import Button from "../button";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  returnPrevPage?: boolean;
  styles?: string[];
  children: React.ReactNode;
}

/**
 * A reusable component for defining modals.
 *
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 * @param {boolean} returnPrevPage Indicates if the modal should return to the previous page upon closing.
 * @param {string[]} styles Optional styling for the modal.
 */
export default function Modal(props: Readonly<ModalProps>) {
  const dict: Dictionary = useDictionary();
  const pathname = usePathname();
  const dialog = useDialog(props.isOpen, props.setIsOpen);
  const transition = useTransitionStyles(dialog.context, {
    duration: 400,
    initial: {
      opacity: 0,
      transform: "translateY(10vh)",
      transition: "transform 400ms ease-out, opacity 400ms ease-out",
    },
  });

  // Close modal when navigating to a new page (pathname change)
  // The ref saves the current pathname to prevent closing the modal on internal navigation
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (props.isOpen) props.setIsOpen(false);
    }
  }, [pathname, props.isOpen, props.setIsOpen]);
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
                  className={`
                    relative bg-muted shadow-xl pointer-events-auto
                    w-full md:w-96 lg:w-4/9 xl:w-1/3 2xl:w-1/4
                    h-dvh md:h-full
                    rounded-t-lg md:rounded-t-none
                    md:border-l border-border
                    transform transition-all duration-300 ease-out
                    flex flex-col min-h-0
                    ${props.styles}
                  `}
                >
                  <Button
                    leftIcon="close"
                    size="icon"
                    variant="ghost"
                    type="button"
                    className="absolute top-2 right-4 !rounded-full"
                    tooltipText={dict.action.close}
                    tooltipPosition="top-end"
                    onClick={() => {
                      props.setIsOpen(false);
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
