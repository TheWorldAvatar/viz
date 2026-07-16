"use client";

import { ScreenType, ScreenTypeMap } from "@/types/settings";
import { useEffect, useRef } from "react";
import { useScreenType } from "./useScreenType";

const THRESHOLD: number = 80;

// Touches starting inside an element with this attribute never arm the pull
// gesture, so overlays with their own drag interactions (e.g. bottom sheets)
// can opt out of triggering a refresh.
export const NO_PULL_REFRESH_ATTRIBUTE: string = "data-no-pull-refresh";
const RESISTANCE: number = 0.5;
const MAX_PULL: number = 120;

/**
 * Retrieves the nearest scrollable ancestor of the touched node, defaulting to
 * the document element when the touch occurred outside any scrollable content.
 */
const getScrollContainer = (target: EventTarget | null): Element => {
    let node: Element | null = target instanceof Element ? target : null;

    while (node && node !== document.body) {
        const overflowY: string = window.getComputedStyle(node).overflowY;
        if (
            (overflowY === "auto" || overflowY === "scroll") &&
            node.scrollHeight > node.clientHeight
        ) {
            return node;
        }
        node = node.parentElement;
    }
    return document.documentElement;
};

/**
 * A custom hook to trigger refresh on pull gesture for mobile.
 *
 * @returns A ref to attach to the pull indicator element, which this hook
 * reveals and moves in step with the gesture.
 */
export const usePullToRefresh = (): React.RefObject<HTMLDivElement | null> => {
    const startY: React.RefObject<number> = useRef<number>(0);
    const pullDistance: React.RefObject<number> = useRef<number>(0);
    const pulling: React.RefObject<boolean> = useRef<boolean>(false);
    const refreshing: React.RefObject<boolean> = useRef<boolean>(false);
    const indicatorRef = useRef<HTMLDivElement>(null);

    const screenType: ScreenType = useScreenType();

    useEffect(() => {
        if (screenType != ScreenTypeMap.MOBILE && screenType != ScreenTypeMap.TABLET) return;

        // Written directly to the DOM to keep the drag off the render path
        const drawIndicator = (delta: number) => {
            const indicator: HTMLDivElement | null = indicatorRef.current;
            if (!indicator) return;
            indicator.style.transition = "none";
            indicator.style.opacity = `${Math.min(delta / THRESHOLD, 1)}`;
            indicator.style.transform = `translateY(${Math.min(delta * RESISTANCE, MAX_PULL)}px)`;
        };

        const onTouchStart = (e: TouchEvent) => {
            if (refreshing.current) return;
            if (
                e.target instanceof Element &&
                e.target.closest(`[${NO_PULL_REFRESH_ATTRIBUTE}]`)
            )
                return;
            // Only trigger refresh if the touched content is scrolled to the top
            if (getScrollContainer(e.target).scrollTop <= 0) {
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
            } else {
                // Dragging back up cancels the pull
                pullDistance.current = 0;
            }
            drawIndicator(pullDistance.current);
        };

        const onTouchEnd = async () => {
            if (!pulling.current) return;
            pulling.current = false;

            const indicator: HTMLDivElement | null = indicatorRef.current;
            if (pullDistance.current >= THRESHOLD) {
                refreshing.current = true;
                // Park the spinner at the threshold so it stays visible for the
                // duration of the reload, which leaves this page up until it lands
                if (indicator) {
                    indicator.style.transition = "transform 200ms ease-out, opacity 200ms ease-out";
                    indicator.style.opacity = "1";
                    indicator.style.transform = `translateY(${THRESHOLD * RESISTANCE}px)`;
                }
                window.location.reload();
            } else if (indicator) {
                indicator.style.transition = "transform 200ms ease-out, opacity 200ms ease-out";
                indicator.style.opacity = "0";
                indicator.style.transform = "translateY(0px)";
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

    return indicatorRef;
};
