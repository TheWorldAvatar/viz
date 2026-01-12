import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { selectIsAnyDrawerOpen, setIsAnyDrawerOpen } from "state/drawer-signal-slice";
import { buildUrl } from "utils/client-utils";

/**
 * A custom hook to manage drawer navigation functionality.
 */
export function useDrawerNavigation() {
    const router = useRouter();
    const isAnyDrawerOpen: boolean = useSelector(selectIsAnyDrawerOpen);
    const dispatch: Dispatch = useDispatch();

    /**
     * Function to navigate to a Intercept route that opens a drawer.
     *
     * @param urlParts The parts of the URL to concatenate.
     */
    const navigateToDrawer = (...urlParts: string[]) => {
        const url: string = buildUrl(...urlParts);
        // If any drawers are opened, replace current drawer
        if (isAnyDrawerOpen) {
            router.replace(url);
        } else {
            // If no drawers are opened, directly open new route
            router.push(url);
        }
    };

    /**
     * Function to handle how the drawer closes on successful execution of buttons in the drawer.
     *
     * @param callback The callback function to execute after closing the drawer.
     */
    const handleDrawerClose = (callback: () => void) => {
        // Executes the callback after a short delay
        setTimeout(() => {
            callback();
        }, 1000);
        // Reset drawer flag slightly after the callback execution
        setTimeout(() => {
            dispatch(setIsAnyDrawerOpen(false));
        }, 1100);
    };

    return { navigateToDrawer, handleDrawerClose };
}
