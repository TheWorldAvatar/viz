"use client";

import { useCallback, useEffect, useState } from "react";


interface useContextMenuReturn {
  contextMenuVisible: boolean;
  x: number;
  y: number;
  closeContextMenu: () => void;
}

/**
 * Opens a page-level context menu on the window `contextmenu` event (desktop mouse right click)
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
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      openContextMenuAtPageCoords(e.pageX, e.pageY);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);;
    };
  }, [openContextMenuAtPageCoords]);

  return {
    contextMenuVisible,
    x: contextMenuPosition.x,
    y: contextMenuPosition.y,
    closeContextMenu,
  };
}
