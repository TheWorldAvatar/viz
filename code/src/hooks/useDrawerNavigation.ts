import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { resetDrawerCount, selectDrawerOpenCount, triggerDrawerClose } from "state/drawer-signal-slice";

const DRAWER_CLOSE_DELAY = 350; // Slightly longer than drawer closing animation (300ms)

/**
 * Hook for navigating to drawer/modal routes with proper sequential handling.
 * If a drawer has already been opened (count >= 1), it will go back first before navigating to the new route.
 * If no drawer has been opened yet (count === 0), it navigates directly.
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

    const navigateToDrawer = (targetUrl: string) => {
        if (drawerOpenCount >= 1) {
            // A drawer has already been opened - go back first, then navigate
            goBackAndCloseDrawer();
            setTimeout(() => {
                router.push(targetUrl);
            }, DRAWER_CLOSE_DELAY);
        } else {
            // No drawer opened yet - navigate directly
            router.push(targetUrl);
        }
    };

    return { navigateToDrawer, drawerOpenCount, goBackAndCloseDrawer };
}
