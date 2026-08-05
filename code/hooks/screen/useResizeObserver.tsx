'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

export interface useResizeObserverReturn {
    contentRef: RefObject<HTMLDivElement>;
    contentHeight: number;
}

/**
 * A custom hook to resize the target DOM element's content based on its open state. 
 * This is usually paired with dynamic containers like accordions.
 * 
 * @param {boolean} isOpen Indicates that the content of the target DOM element is visible.
 */
export const useResizeObserver = (isOpen: boolean): useResizeObserverReturn => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);
    useEffect(() => {
        if (contentRef.current) {
            const updateHeight = () => {
                if (contentRef.current) {
                    const height = contentRef.current.scrollHeight;
                    setContentHeight(height);
                }
            };
            updateHeight();

            const resizeObserver = new ResizeObserver(() => {
                updateHeight();
            });

            // Start observing the content for size changes
            resizeObserver.observe(contentRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [isOpen]);
    return { contentRef, contentHeight };
}