import { useCallback, useEffect, useState } from "react";

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

interface useContextMenuReturn {
  contextMenuVisible: boolean;
  x: number;
  y: number;
  closeContextMenu: () => void;
}

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
export function useContextMenu(): useContextMenuReturn {
  const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number; }>({ x: 0, y: 0 });

  const openContextMenuAtPageCoords = useCallback((x: number, y: number) => {
    setContextMenuVisible(true);
    setContextMenuPosition({ x, y });
  }, []);

  const closeContextMenu = () => setContextMenuVisible(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startX: number = 0;
    let startY: number = 0;
    let activePointerId: number | undefined;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      openContextMenuAtPageCoords(e.pageX, e.pageY);
    };

    const clearTimer = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      if (e.button !== 0) return;
      if (activePointerId !== undefined) return;

      startX = e.clientX;
      startY = e.clientY;
      activePointerId = e.pointerId;
 
      timer = setTimeout(() => {
        timer = undefined;
        const { x, y } = pageCoordsFromClient(startX, startY);
        openContextMenuAtPageCoords(x, y);
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

    window.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endPointer);
    document.addEventListener("pointercancel", endPointer);
    document.addEventListener("pointerleave", endPointer);

    return () => {
      clearTimer();
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endPointer);
      document.removeEventListener("pointercancel", endPointer);
      document.removeEventListener("pointerleave", endPointer);
    };
  }, [openContextMenuAtPageCoords]);

  return {
    contextMenuVisible,
    x: contextMenuPosition.x,
    y: contextMenuPosition.y,
    closeContextMenu,
  };
}
