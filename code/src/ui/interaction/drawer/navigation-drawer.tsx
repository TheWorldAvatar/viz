import React from "react";

import { useRouter } from "next/navigation";
import Drawer from "./drawer";

interface NavigationDrawerProps {
  isControlledOpen?: boolean;
  setIsControlledOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

/**
 * A drawer component that slides in from the right edge of the screen to display additional content without interrupting the main view.
 * This drawer component is a variant that will navigate back in the browser history on closed.
 *
 * @param {boolean} isControlledOpen Optional controlled state for showing/hiding the drawer.
 * @param  setIsControlledOpen Optional controlled dispatch state to show/hide drawer.
 */
export default function NavigationDrawer(
  props: Readonly<NavigationDrawerProps>
) {
  const router = useRouter();

  return (
    <Drawer
      isControlledOpen={props.isControlledOpen}
      setIsControlledOpen={props.setIsControlledOpen}
      onClose={() => router.back()}
    >
      {props.children}
    </Drawer>
  );
}
