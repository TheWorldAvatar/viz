import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import React from "react";

import { useDialog } from "hooks/float/useDialog";
import { Paths, Routes } from "io/config/routes";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { getCurrentEntityType, setCurrentEntityType } from "state/registry-slice";
import Button from "../button";

interface DrawerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  returnPrevPage?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 *
 * @param {boolean} isOpen Indicates if modal should be initially open.
 * @param  setIsOpen Sets the isOpen parameter.
 * @param {boolean} returnPrevPage Indicates if the modal should return to the previous page upon closing.
 * @param {string} className Optional styling for the modal.
 */
export default function Drawer(props: Readonly<DrawerProps>) {
  const url: string = usePathname();
  const router: AppRouterInstance = useRouter();
  const dispatch: Dispatch = useDispatch();
  const currentEntityType: string = useSelector(getCurrentEntityType);
  const dialog = useDialog(props.isOpen, props.setIsOpen, false);
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
                  className={`
                    relative bg-muted shadow-xl pointer-events-auto
                    w-full md:w-96 lg:w-4/9 xl:w-1/3 2xl:w-1/4
                    h-dvh md:h-full
                    rounded-t-lg md:rounded-t-none
                    md:border-l border-border
                    flex flex-col min-h-0
                    ${props.className}
                  `}
                >
                  <Button
                    leftIcon="close"
                    size="icon"
                    variant="ghost"
                    type="button"
                    className="absolute top-2 right-4 !rounded-full"
                    onClick={() => handleClose(url, currentEntityType, props.setIsOpen, router, dispatch)}
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

/**
 * Handles the events when closing the drawer.
 * 
 * @param {string} url The target url to check.
 * @param  setIsOpen Sets the open state.
 * @param  router NextJS App router object.
 * @param {Dispatch<any>} dispatch The dispatch function from Redux for dispatching actions.
 */
function handleClose(url: string, currentEntityType: string, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>, router: AppRouterInstance, dispatch: Dispatch) {
  // Checks if the current page is a static active page where opening a modal does not redirect the user to a new path
  if ([Paths.REGISTRY_TASK_OUTSTANDING, Paths.REGISTRY_TASK_SCHEDULED, Paths.REGISTRY_TASK_CLOSED].some(path => url.includes(path))) {
    setIsOpen(false);
  } else {
    if (currentEntityType != "") {
      setIsOpen(false);
      dispatch(setCurrentEntityType(""));
      router.push(`${Routes.REGISTRY_GENERAL}/${currentEntityType}`)
    }
  }
}

