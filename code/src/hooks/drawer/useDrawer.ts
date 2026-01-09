import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCloseSignal, selectIsAnyDrawerOpen, setCloseSignal, setIsAnyDrawerOpen } from "state/drawer-signal-slice";

/**
 * A custom hook to manage drawer functionality.
 * 
 * @param setIsOpen Dispatch function to set the open state of the drawer.
*/
export function useDrawer(setIsOpen: React.Dispatch<React.SetStateAction<boolean>>) {
    const dispatch = useDispatch();
    const closeSignal: boolean = useSelector(selectCloseSignal);
    const isAnyDrawerOpen: boolean = useSelector(selectIsAnyDrawerOpen);

    // Function to reset the open drawer flag.
    const resetDrawerOpenFlag = () => {
        dispatch(setIsAnyDrawerOpen(false));
    };

    // Set drawer open state to true for first render of drawer
    useEffect(() => {
        dispatch(setIsAnyDrawerOpen(true));
    }, []);

    // Whenever close signal is triggered, closes the drawer if any is opened
    useEffect(() => {
        if (closeSignal) {
            dispatch(setCloseSignal(false));
            if (isAnyDrawerOpen) {
                resetDrawerOpenFlag();
                setIsOpen(false);
            }
        }
    }, [closeSignal]);

    return { resetDrawerOpenFlag };
}
