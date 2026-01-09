import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectIsAnyDrawerOpen } from "state/drawer-signal-slice";

/**
 * A custom hook to manage drawer navigation functionality.
 */
export function useDrawerNavigation() {
    const router = useRouter();
    const isAnyDrawerOpen: boolean = useSelector(selectIsAnyDrawerOpen);

    // Function to go back in history
    const routeBack = () => {
        router.back();
    };

    /**
     * Function to navigate to a Intercept route that opens a drawer.
     *
     * @param targetUrl New route
     */
    const navigateToDrawer = (targetUrl: string) => {
        // If any drawers are opened, replace current drawer
        if (isAnyDrawerOpen) {
            router.replace(targetUrl);
        } else {
            // If no drawers are opened, directly open new route
            router.push(targetUrl);
        }
    };

    return { navigateToDrawer, routeBack };
}
