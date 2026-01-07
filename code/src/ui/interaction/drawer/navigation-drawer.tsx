
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { incrementDrawerCount, selectCloseSignal } from "state/drawer-signal-slice";
import Drawer from "./drawer";
import { useDrawerNavigation } from "hooks/useDrawerNavigation";

interface NavigationDrawerProps {
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 * This drawer component is a variant that will navigate back in the browser history on close.
 */
export default function NavigationDrawer(
  props: Readonly<NavigationDrawerProps>
) {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true); // Start as true immediately

  const closeSignal = useSelector(selectCloseSignal);
  const initialCloseSignalRef = useRef<number>(closeSignal);
  const { goBackAndCloseDrawer } = useDrawerNavigation();



  // Increment drawer count when mounted
  useEffect(() => {
    dispatch(incrementDrawerCount());
  }, [dispatch]);

  // Close drawer when global close signal is triggered
  useEffect(() => {
    if (closeSignal !== initialCloseSignalRef.current) {
      setIsOpen(false);
    }
  }, [closeSignal]);

  return (
    <Drawer
      isExternalOpen={isOpen}
      setIsExternalOpen={setIsOpen}
      onClose={() => {
        goBackAndCloseDrawer();
      }}
    >
      {props.children}
    </Drawer>
  );
}
