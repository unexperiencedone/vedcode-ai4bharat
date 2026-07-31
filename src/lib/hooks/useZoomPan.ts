"use client";
import { useRef, useState, useCallback, useEffect } from "react";

export interface ZoomPanState {
  x: number;
  y: number;
  scale: number;
}

export function useZoomPan(initial: ZoomPanState = { x: 0, y: 0, scale: 1 }) {
  const [t, setT] = useState<ZoomPanState>(initial);
  const [isDragging, setIsDragging] = useState(false);
  // store the origin offset for drag so we don't chase state inside onMouseMove
  const dragOrigin = useRef<{ ox: number; oy: number } | null>(null);
  // store latest t for handlers that need it without re-binding
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setT((prev) => {
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const scale = Math.min(3, Math.max(0.12, prev.scale * factor));
      // zoom toward the cursor point
      const x = cx - (cx - prev.x) * (scale / prev.scale);
      const y = cy - (cy - prev.y) * (scale / prev.scale);
      return { x, y, scale };
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragOrigin.current = { ox: e.clientX - tRef.current.x, oy: e.clientY - tRef.current.y };
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const origin = dragOrigin.current;
    if (!origin) return;
    // Snapshot origin now — setT's updater runs later (batched render phase),
    // by which time a mouseup in between could have already nulled the ref.
    setT((prev) => ({
      ...prev,
      x: e.clientX - origin.ox,
      y: e.clientY - origin.oy,
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragOrigin.current = null;
    setIsDragging(false);
  }, []);

  /**
   * Fit the entire graph (graphW × graphH) inside the viewport (viewW × viewH)
   * with a small margin, centred.
   */
  const fitToView = useCallback(
    (graphW: number, graphH: number, viewW: number, viewH: number) => {
      const scale = Math.min(viewW / graphW, viewH / graphH, 1) * 0.88;
      setT({
        x: (viewW - graphW * scale) / 2,
        y: (viewH - graphH * scale) / 2,
        scale,
      });
    },
    []
  );

  const zoomIn = useCallback(
    () => setT((p) => ({ ...p, scale: Math.min(3, p.scale * 1.25) })),
    []
  );
  const zoomOut = useCallback(
    () => setT((p) => ({ ...p, scale: Math.max(0.12, p.scale / 1.25) })),
    []
  );

  return { t, setT, isDragging, onWheel, onMouseDown, onMouseMove, onMouseUp, fitToView, zoomIn, zoomOut };
}
