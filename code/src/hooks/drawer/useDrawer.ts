import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsAnyDrawerOpen } from "state/drawer-signal-slice";

/**
 * A custom hook to manage drawer functionality.
*/
export function useDrawer() {
    const dispatch = useDispatch();

    // Function to reset the open drawer flag.
    const resetDrawerOpenFlag = () => {
        dispatch(setIsAnyDrawerOpen(false));
    };

    // Set drawer open state to true for first render of drawer
    useEffect(() => {
        dispatch(setIsAnyDrawerOpen(true));
    }, []);

    return { resetDrawerOpenFlag };
}
