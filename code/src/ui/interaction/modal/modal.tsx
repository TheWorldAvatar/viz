import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import React from "react";

import { useDialog } from "hooks/float/useDialog";

import { useRouter } from "next/navigation";
import Button from "../button";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  returnPrevPage?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A reusable component for defining modals.
 *
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 * @param {boolean} returnPrevPage Indicates if the modal should return to the previous page upon closing.
 * @param {string} className Optional styling for the modal.
 */
export default function Modal(props: Readonly<ModalProps>) {
  const router = useRouter();
  const dialog = useDialog(props.isOpen, props.setIsOpen, true);
  const transition = useTransitionStyles(dialog.context, {
    duration: 400,
    initial: {
      opacity: 0,
      transform: "translateY(10vh)",
    },
  });
  return (
    <>
      {dialog.open && (
        <FloatingPortal>
          <FloatingOverlay
            className="flex justify-center items-center z-[999] bg-inverse-primary"
            lockScroll
          >
            <FloatingFocusManager context={dialog.context}>
              <div
                ref={dialog.refs.setFloating}
                style={{
                  ...dialog.floatingStyles,
                  zIndex: 999998, // Second highest z-index so it hides other content but is hidden before tooltips
                }}
                className="relative flex items-center justify-center h-full w-full  "
                onClick={(event: React.MouseEvent) => {
                  if (event.target === event.currentTarget) {
                    props.setIsOpen(false);
                    if (props.returnPrevPage) {
                      router.back();
                    }
                  }
                }}
                {...dialog.getFloatingProps()}
              >
                <div
                  style={{
                    ...transition.styles,
                  }}
                  className={`relative flex flex-col w-full h-dvh md:h-fit md:w-11/12 xl:w-1/2 mx-auto justify-between py-4 px-4 md:px-8 bg-muted md:border-1 md:shadow-2xl md:border-border md:rounded-xl ${props.className}`}
                >
                  <Button
                    leftIcon="close"
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-4 !rounded-full"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      props.setIsOpen(false);
                      if (props.returnPrevPage) {
                        router.back();
                      }
                    }}
                  />
                  {props.children}
                </div>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </>
  );
}
