import React, { useEffect, useRef, useState } from "react";

// Releasing the panel dragged down beyond this fraction of its height dismisses the sheet.
const CLOSE_RATIO: number = 0.4;
// Downward pointer speed (px/ms) that dismisses the sheet regardless of position.
const FLICK_VELOCITY: number = 0.5;
// A flick only dismisses once dragged this far, so a stray twitch on tap cannot close the sheet.
const FLICK_MIN_RATIO: number = 0.1;

interface UseDraggableSheetParams {
  enabled: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface UseDraggableSheetReturn {
  sheetRef: React.RefObject<HTMLDivElement>;
  sheetStyle: React.CSSProperties;
  dragHandleProps: Pick<
    React.HTMLAttributes<HTMLDivElement>,
    "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
  >;
}

/**
 * A hook that provides the necessary props to make a bottom sheet draggable.
 * 
 * @param {boolean} enabled Whether the drag behaviour is active.
 * @param {boolean} isOpen Current open state, used to reset the offset once closed.
 * @param {void} onClose Invoked when the sheet is dragged past the close threshold.
 */
export function useDraggableSheet(props: Readonly<UseDraggableSheetParams>): UseDraggableSheetReturn {
  // The height collapsed away from the sheet. 0 means fully expanded.
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sheetRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const offsetRef: React.RefObject<number> = useRef(0);
  // Height of the fully expanded sheet, refreshed when a drag starts.
  const sheetHeightRef: React.RefObject<number> = useRef(0);
  const dragStart: React.RefObject<{ pointerY: number; offset: number } | null> = useRef(null);
  // Last pointer sample used to derive the release velocity (px per ms, positive = downward).
  const lastSample: React.RefObject<{ y: number; time: number; velocity: number }> = useRef({ y: 0, time: 0, velocity: 0 });

  const applyOffset = (value: number) => {
    offsetRef.current = value;
    setDragOffset(value);
  };

  // Reset the drag offset once the sheet is closed so it reopens fully expanded.
  useEffect(() => {
    if (!props.isOpen) {
      applyOffset(0);
    }
  }, [props.isOpen]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    // The visible height plus the amount already collapsed away restores the expanded height.
    sheetHeightRef.current = (sheetRef.current?.offsetHeight ?? window.innerHeight) + offsetRef.current;
    dragStart.current = {
      pointerY: event.clientY,
      offset: offsetRef.current,
    };
    lastSample.current = { y: event.clientY, time: event.timeStamp, velocity: 0 };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }
    const delta: number = event.clientY - dragStart.current.pointerY;
    applyOffset(Math.min(sheetHeightRef.current, Math.max(0, dragStart.current.offset + delta)));

    const elapsed: number = event.timeStamp - lastSample.current.time;
    if (elapsed > 0) {
      lastSample.current = {
        y: event.clientY,
        time: event.timeStamp,
        velocity: (event.clientY - lastSample.current.y) / elapsed,
      };
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
    setIsDragging(false);

    const offset: number = offsetRef.current;
    const velocity: number = lastSample.current.velocity;

    // The sheet is either expanded or gone, so it always springs back and only the release decides
    // whether it is also dismissed: a downward flick, or a slow drag past the close threshold.
    applyOffset(0);
    if ((velocity > FLICK_VELOCITY && offset > sheetHeightRef.current * FLICK_MIN_RATIO)
      || offset > sheetHeightRef.current * CLOSE_RATIO) {
      props.onClose();
    }
  };

  if (!props.enabled) {
    return { sheetRef, sheetStyle: {}, dragHandleProps: {} };
  }

  return {
    sheetRef,
    sheetStyle: {
      maxHeight: dragOffset === 0 ? "100dvh" : `${Math.max(0, sheetHeightRef.current - dragOffset)}px`,
      transition: isDragging ? "none" : "max-height 300ms ease-out",
    },
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
