import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectDrawerOpenCount } from "state/drawer-signal-slice";

const DRAWER_CLOSE_DELAY = 350; // Slightly longer than drawer closing animation (300ms)

/**
 * Hook for navigating to drawer/modal routes with proper sequential handling.
 * If a drawer has already been opened (count >= 1), it will go back first before navigating to the new route.
 * If no drawer has been opened yet (count === 0), it navigates directly.
 */
export function useDrawerNavigation() {
    const router = useRouter();
    const drawerOpenCount = useSelector(selectDrawerOpenCount);

    const navigateToDrawer = useCallback((targetUrl: string) => {
        if (drawerOpenCount >= 1) {
            // A drawer has already been opened - go back first, then navigate
            router.back();
            setTimeout(() => {
                router.push(targetUrl);
            }, DRAWER_CLOSE_DELAY);
        } else {
            // No drawer opened yet - navigate directly
            router.push(targetUrl);
        }
    }, [drawerOpenCount, router]);

    return { navigateToDrawer, drawerOpenCount };
}
