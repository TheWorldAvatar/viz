import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDrawer } from "hooks/drawer/useDrawer";
import Drawer from "./drawer";

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
  const [isOpen, setIsOpen] = useState(true); // Start as true immediately
  const router = useRouter();
  const { resetDrawerOpenFlag } = useDrawer(setIsOpen);

  return (
    <Drawer
      isExternalOpen={isOpen}
      setIsExternalOpen={setIsOpen}
      onClose={() => {
        resetDrawerOpenFlag();
        router.back();
      }}
    >
      {props.children}
    </Drawer>
  );
}
