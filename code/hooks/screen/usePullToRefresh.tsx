"use client";

import { ScreenType, ScreenTypeMap } from "@/types/settings";
import { useEffect, useRef } from "react";
import { useScreenType } from "./useScreenType";

const THRESHOLD: number = 80;
const TOP_TOLERANCE: number = 45;

/**
 * A custom hook to trigger refresh on pull gesture for mobile.
 */
export const usePullToRefresh = (): void => {
    const startY: React.RefObject<number> = useRef<number>(0);
    const pullDistance: React.RefObject<number> = useRef<number>(0);
    const pulling: React.RefObject<boolean> = useRef<boolean>(false);

    const screenType: ScreenType = useScreenType();

    useEffect(() => {
        if (screenType != ScreenTypeMap.MOBILE) return;
        const onTouchStart = (e: TouchEvent) => {
            // Only trigger refresh if user are at the top of the screen
            if (e.touches[0].clientY <= TOP_TOLERANCE) {
                startY.current = e.touches[0].clientY;
                pulling.current = true;
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pulling.current) return;
            const delta: number = e.touches[0].clientY - startY.current;

            // For downward drag
            if (delta > 0) {
                e.preventDefault();
                pullDistance.current = delta;
            }
        };

        const onTouchEnd = async () => {
            if (!pulling.current) return;
            pulling.current = false;

            if (pullDistance.current >= THRESHOLD) {
                window.location.reload();
            }
            pullDistance.current = 0;
        };

        // States are being set to trigger ongoing effects in the later
        document.addEventListener("touchstart", onTouchStart, { passive: true });
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onTouchEnd);

        return () => {
            document.removeEventListener("touchstart", onTouchStart);
            document.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("touchend", onTouchEnd);
        };
    }, [screenType]);
}