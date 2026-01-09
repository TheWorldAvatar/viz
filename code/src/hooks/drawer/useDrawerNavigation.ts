import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectIsAnyDrawerOpen } from "state/drawer-signal-slice";
import { buildUrl } from "utils/client-utils";

/**
 * A custom hook to manage drawer navigation functionality.
 */
export function useDrawerNavigation() {
    const router = useRouter();
    const isAnyDrawerOpen: boolean = useSelector(selectIsAnyDrawerOpen);

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

    return { navigateToDrawer };
}
