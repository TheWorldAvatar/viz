import React, { useEffect, useRef, useState } from "react";

// Fraction of the sheet height the panel is translated down when snapped to peek.
const PEEK_RATIO = 0.55;
// Releasing the panel dragged down beyond this fraction of its height dismisses the sheet.
const CLOSE_RATIO = 0.75;
// Downward pointer speed (px/ms) that dismisses the sheet regardless of position.
const FLICK_VELOCITY = 0.5;

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
  // Vertical offset applied to the sheet while dragging. 0 means fully expanded.
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sheetRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const offsetRef: React.RefObject<number> = useRef(0);
  const dragStart: React.RefObject<{ pointerY: number; offset: number; sheetHeight: number } | null> = useRef(null);
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
    dragStart.current = {
      pointerY: event.clientY,
      offset: offsetRef.current,
      sheetHeight: sheetRef.current?.offsetHeight ?? window.innerHeight,
    };
    lastSample.current = { y: event.clientY, time: event.timeStamp, velocity: 0 };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return;
    }
    // Dragging down increases clientY, which pushes the sheet further off screen.
    const delta: number = event.clientY - dragStart.current.pointerY;
    applyOffset(Math.min(dragStart.current.sheetHeight, Math.max(0, dragStart.current.offset + delta)));

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
    const { sheetHeight } = dragStart.current;
    dragStart.current = null;
    setIsDragging(false);

    const peekOffset: number = sheetHeight * PEEK_RATIO;
    const offset: number = offsetRef.current;
    const velocity: number = lastSample.current.velocity;

    // A downward flick, or a slow drag past the close threshold, dismisses the sheet.
    if ((velocity > FLICK_VELOCITY && offset > peekOffset / 2) || offset > sheetHeight * CLOSE_RATIO) {
      applyOffset(0);
      props.onClose();
      return;
    }
    // An upward flick expands; otherwise snap to the nearer of expanded (0) or peek.
    if (velocity < -FLICK_VELOCITY) {
      applyOffset(0);
      return;
    }
    applyOffset(offset > peekOffset / 2 ? peekOffset : 0);
  };

  if (!props.enabled) {
    return { sheetRef, sheetStyle: {}, dragHandleProps: {} };
  }

  return {
    sheetRef,
    sheetStyle: {
      transform: `translateY(${dragOffset}px)`,
      transition: isDragging ? "none" : "transform 300ms ease-out",
    },
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
