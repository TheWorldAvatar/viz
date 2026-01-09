import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetDrawerCount, selectDrawerOpenCount, triggerDrawerClose } from "state/drawer-signal-slice";

/**
 * A custom hook to provide drawer navigation functionality.
 */
export function useDrawerNavigation() {
    const router = useRouter();
    const dispatch = useDispatch();
    const drawerOpenCount = useSelector(selectDrawerOpenCount);

    // Function to go back in history and close the drawer
    const goBackAndCloseDrawer = (time: number = 100) => {
        setTimeout(() => {
            dispatch(triggerDrawerClose());
            dispatch(resetDrawerCount());
        }, time)
        router.back();
    };

    /**
     * Function to navigate to a Intercept route that opens a drawer.
     *
     * @param targetUrl New route
     */
    const navigateToDrawer = (targetUrl: string) => {
        // If any drawers are opened, replace current drawer
        if (drawerOpenCount >= 1) {
            router.replace(targetUrl);
        } else {
            // If no drawers are opened, directly open new route
            router.push(targetUrl);
        }
    };

    return { navigateToDrawer, drawerOpenCount, goBackAndCloseDrawer };
}
