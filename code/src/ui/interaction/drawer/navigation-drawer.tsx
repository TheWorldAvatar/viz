import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCloseSignal } from "state/drawer-signal-slice";
import Drawer from "./drawer";

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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true); // Start as true immediately

  // Listen for global close signal from Redux
  const closeSignal = useSelector(selectCloseSignal);
  const initialCloseSignalRef = useRef<number>(closeSignal);

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
        // Only navigate back when user clicks X button
        // Don't dispatch signal here as it would conflict with navigation
        router.back();
      }}
    >
      {props.children}
    </Drawer>
  );
}
