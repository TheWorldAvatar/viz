import { useEffect } from "react";

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

function pageCoordsFromClient(clientX: number, clientY: number) {
  return {
    x: clientX + window.scrollX,
    y: clientY + window.scrollY,
  };
}

/**
 * Opens a page-level context menu on the window `contextmenu` event (desktop mouse right click)
 * and on long-press with the primary pointer for touch and pen anywhere on the document (mobile, tablet, etc.).
 */
export function useContextMenuOpen(
  openAtPageCoords: (x: number, y: number) => void,
): void {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      openAtPageCoords(e.pageX, e.pageY);
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [openAtPageCoords]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startX: number = 0;
    let startY: number = 0;
    let activePointerId: number | undefined;

    const clearTimer = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      if (e.button !== 0) return;

      startX = e.clientX;
      startY = e.clientY;
      activePointerId = e.pointerId;
      clearTimer();

      timer = setTimeout(() => {
        timer = undefined;
        const { x, y } = pageCoordsFromClient(startX, startY);
        openAtPageCoords(x, y);
      }, LONG_PRESS_MS);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activePointerId !== e.pointerId) return;
      const dx: number = Math.abs(e.clientX - startX);
      const dy: number = Math.abs(e.clientY - startY);
      if (dx > LONG_PRESS_MOVE_THRESHOLD_PX || dy > LONG_PRESS_MOVE_THRESHOLD_PX) {
        clearTimer();
        activePointerId = undefined;
      }
    };

    const endPointer = (e: PointerEvent) => {
      if (activePointerId !== e.pointerId) return;
      clearTimer();
      activePointerId = undefined;
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endPointer);
    document.addEventListener("pointercancel", endPointer);
    document.addEventListener("pointerleave", endPointer);

    return () => {
      clearTimer();
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endPointer);
      document.removeEventListener("pointercancel", endPointer);
      document.removeEventListener("pointerleave", endPointer);
    };
  }, [openAtPageCoords]);
}
