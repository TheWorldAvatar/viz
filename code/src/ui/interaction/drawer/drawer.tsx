import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDialog } from "hooks/float/useDialog";
import {
  closeDrawer,
  selectDrawerIsOpen,
  setDrawerOpen,
} from "state/drawer-component-slice";
import Button from "../button";

interface DrawerProps {
  onClose?: () => void;
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 * This component is entirely controlled by Redux state.
 *
 * @param onClose Optional function to be executed on close.
 */
export default function Drawer(props: Readonly<DrawerProps>) {
  const dispatch = useDispatch();
  const isOpen: boolean = useSelector(selectDrawerIsOpen);

  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    dispatch(setDrawerOpen(value as boolean));
  };

  const dialog = useDialog(isOpen, setOpen, false);
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
                      dispatch(closeDrawer());
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
