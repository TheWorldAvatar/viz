import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setIsAnyDrawerOpen } from "state/drawer-signal-slice";
import Drawer from "./drawer";
import { setOpenFormCount, selectOpenFormCount } from "state/form-persistence-slice";

interface NavigationDrawerProps {
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 * This drawer component is a variant that will affect the browser history stack.
 */
export default function NavigationDrawer(
  props: Readonly<NavigationDrawerProps>
) {
  const router = useRouter();
  const dispatch = useDispatch();
  const openFormCount = useSelector(selectOpenFormCount);
  const [isOpen, setIsOpen] = useState(true); // Start as true immediately

  // Function to reset the open drawer flag
  const resetDrawerOpenFlag = () => {
    dispatch(setIsAnyDrawerOpen(false));
  };

  // Set drawer open state to true for first render of drawer
  useEffect(() => {
    dispatch(setIsAnyDrawerOpen(true));
  }, []);

  return (
    <Drawer
      isExternalOpen={isOpen}
      setIsExternalOpen={setIsOpen}
      onClose={() => {
        dispatch(setOpenFormCount(openFormCount - 1));
        resetDrawerOpenFlag();
        router.back();
      }}
    >
      {props.children}
    </Drawer>
  );
}
