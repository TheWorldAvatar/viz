import { useRouter } from "next/navigation";
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

  return <Drawer onClose={() => router.back()}>{props.children}</Drawer>;
}
