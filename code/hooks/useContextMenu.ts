"use client";

import { useEffect, useState } from "react";


interface useContextMenuReturn {
  contextMenuVisible: boolean;
  x: number;
  y: number;
}

/**
 * Opens a page-level context menu on the window `contextmenu` event (desktop mouse right click)
 */
export function useContextMenu(): useContextMenuReturn {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.pageX, y: e.pageY });
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu]);

  return {
    contextMenuVisible: contextMenu !== null,
    x: contextMenu?.x,
    y: contextMenu?.y,
  };
}