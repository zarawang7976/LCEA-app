import { useCallback, useEffect, useRef, useState } from "react";
import { trackCalculatorUsed } from "../analytics";
import { useLanguage } from "../i18n/LanguageContext";
import type { CircleMarker, Point } from "../types";
import { computeLcea, getLceaCategory, leftLceaDisplay } from "../types";
import { WATERMARK_OPACITY, WATERMARK_SVG_ROTATE, WATERMARK_TEXT } from "../utils/watermark";

const DEFAULT_CIRCLE_R = 24;
const MIN_R = 8;
const MAX_R = 80;
const DOT_R = 5;
const HIT_PAD = 12;

const LEFT_STROKE = "#c0a7d3";
const LEFT_DOT = "#a890b8";
const RIGHT_STROKE = "#a7d3b8";
const RIGHT_DOT = "#8bc4a0";

type DragKind = "circle1" | "circle2" | "dotLeft" | "dotRight" | "resize1" | "resize2";

const RESIZE_EDGE_RATIO = 0.75;

interface ImageViewerProps {
  imageUrl: string;
  circle1: CircleMarker;
  circle2: CircleMarker;
  lateralEdgeLeft: Point;
  lateralEdgeRight: Point;
  onCircle1Change: (c: CircleMarker) => void;
  onCircle2Change: (c: CircleMarker) => void;
  onLateralEdgeLeftChange: (p: Point) => void;
  onLateralEdgeRightChange: (p: Point) => void;
  onContainerSize?: (size: { w: number; h: number }) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function ImageViewer({
  imageUrl,
  circle1,
  circle2,
  lateralEdgeLeft,
  lateralEdgeRight,
  onCircle1Change,
  onCircle2Change,
  onLateralEdgeLeftChange,
  onLateralEdgeRightChange,
  onContainerSize,
  containerRef: containerRefProp,
}: ImageViewerProps) {
  const { t } = useLanguage();
  const containerRefLocal = useRef<HTMLDivElement>(null);
  const containerRef = containerRefProp ?? containerRefLocal;
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 400, h: 400 });
  const [dragging, setDragging] = useState<DragKind | null>(null);
  const dragStart = useRef<{ x: number; y: number; cx: number; cy: number; r?: number } | null>(null);
  const initialPlacementDone = useRef(false);
  const lastImageUrl = useRef("");

  const updateSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const next = { w: rect.width, h: rect.height };
      setContainerSize(next);
      onContainerSize?.(next);
    }
  }, [onContainerSize]);

  const handleImageLoad = useCallback(() => {
    updateSize();
  }, [updateSize]);

  useEffect(() => {
    updateSize();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageUrl, updateSize]);

  useEffect(() => {
    if (imageUrl !== lastImageUrl.current) {
      lastImageUrl.current = imageUrl;
      initialPlacementDone.current = false;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl || initialPlacementDone.current || containerSize.w <= 1) return;
    const unset =
      circle1.cx === 0 &&
      circle1.cy === 0 &&
      circle2.cx === 0 &&
      circle2.cy === 0 &&
      lateralEdgeLeft.x === 0 &&
      lateralEdgeLeft.y === 0 &&
      lateralEdgeRight.x === 0 &&
      lateralEdgeRight.y === 0;
    if (!unset) return;
    const w = containerSize.w;
    const h = containerSize.h;
    onCircle1Change({ cx: w * 0.28, cy: h * 0.55, r: DEFAULT_CIRCLE_R });
    onCircle2Change({ cx: w * 0.72, cy: h * 0.55, r: DEFAULT_CIRCLE_R });
    onLateralEdgeLeftChange({ x: w * 0.32, y: h * 0.32 });
    onLateralEdgeRightChange({ x: w * 0.68, y: h * 0.32 });
    initialPlacementDone.current = true;
  }, [
    imageUrl,
    containerSize,
    circle1.cx,
    circle1.cy,
    circle2.cx,
    circle2.cy,
    lateralEdgeLeft.x,
    lateralEdgeLeft.y,
    lateralEdgeRight.x,
    lateralEdgeRight.y,
    onCircle1Change,
    onCircle2Change,
    onLateralEdgeLeftChange,
    onLateralEdgeRightChange,
  ]);

  const getEventPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const clientX =
        "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
      const clientY =
        "touches" in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const startDrag = useCallback(
    (kind: DragKind, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pt = getEventPoint(e);
      if (kind === "circle1")
        dragStart.current = { x: pt.x, y: pt.y, cx: circle1.cx, cy: circle1.cy };
      if (kind === "circle2")
        dragStart.current = { x: pt.x, y: pt.y, cx: circle2.cx, cy: circle2.cy };
      if (kind === "resize1")
        dragStart.current = { x: pt.x, y: pt.y, cx: circle1.cx, cy: circle1.cy, r: circle1.r };
      if (kind === "resize2")
        dragStart.current = { x: pt.x, y: pt.y, cx: circle2.cx, cy: circle2.cy, r: circle2.r };
      if (kind === "dotLeft")
        dragStart.current = { x: pt.x, y: pt.y, cx: lateralEdgeLeft.x, cy: lateralEdgeLeft.y };
      if (kind === "dotRight")
        dragStart.current = { x: pt.x, y: pt.y, cx: lateralEdgeRight.x, cy: lateralEdgeRight.y };
      setDragging(kind);
    },
    [circle1, circle2, lateralEdgeLeft, lateralEdgeRight, getEventPoint]
  );

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging || !dragStart.current || !containerRef.current) return;
      e.preventDefault();
      const pt = getEventPoint(e);
      const rect = containerRef.current.getBoundingClientRect();

      if (dragging === "resize1" && dragStart.current.r != null) {
        const d = Math.hypot(pt.x - circle1.cx, pt.y - circle1.cy);
        const nr = clamp(d, MIN_R, MAX_R);
        onCircle1Change({ ...circle1, r: nr });
        return;
      }
      if (dragging === "resize2" && dragStart.current.r != null) {
        const d = Math.hypot(pt.x - circle2.cx, pt.y - circle2.cy);
        const nr = clamp(d, MIN_R, MAX_R);
        onCircle2Change({ ...circle2, r: nr });
        return;
      }

      const dx = pt.x - dragStart.current.x;
      const dy = pt.y - dragStart.current.y;
      const nx = clamp(dragStart.current.cx + dx, 0, rect.width);
      const ny = clamp(dragStart.current.cy + dy, 0, rect.height);

      if (dragging === "circle1") onCircle1Change({ ...circle1, cx: nx, cy: ny });
      if (dragging === "circle2") onCircle2Change({ ...circle2, cx: nx, cy: ny });
      if (dragging === "dotLeft") onLateralEdgeLeftChange({ x: nx, y: ny });
      if (dragging === "dotRight") onLateralEdgeRightChange({ x: nx, y: ny });
    },
    [
      dragging,
      circle1,
      circle2,
      onCircle1Change,
      onCircle2Change,
      onLateralEdgeLeftChange,
      onLateralEdgeRightChange,
      getEventPoint,
    ]
  );

  const endDrag = useCallback(() => {
    setDragging(null);
    dragStart.current = null;
  }, []);

  const hit = useCallback(
    (px: number, py: number): DragKind | null => {
      const d1 = Math.hypot(px - circle1.cx, py - circle1.cy);
      const d2 = Math.hypot(px - circle2.cx, py - circle2.cy);
      const dLeft = Math.hypot(px - lateralEdgeLeft.x, py - lateralEdgeLeft.y);
      const dRight = Math.hypot(px - lateralEdgeRight.x, py - lateralEdgeRight.y);

      if (dLeft <= DOT_R + HIT_PAD) return "dotLeft";
      if (dRight <= DOT_R + HIT_PAD) return "dotRight";
      if (d1 >= circle1.r * RESIZE_EDGE_RATIO && d1 <= circle1.r + HIT_PAD) return "resize1";
      if (d2 >= circle2.r * RESIZE_EDGE_RATIO && d2 <= circle2.r + HIT_PAD) return "resize2";
      if (d1 <= circle1.r * RESIZE_EDGE_RATIO) return "circle1";
      if (d2 <= circle2.r * RESIZE_EDGE_RATIO) return "circle2";
      return null;
    },
    [circle1, circle2, lateralEdgeLeft, lateralEdgeRight]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const pt = getEventPoint(e);
      const target = hit(pt.x, pt.y);
      if (target) startDrag(target, e);
    },
    [getEventPoint, hit, startDrag]
  );

  const center1: Point = { x: circle1.cx, y: circle1.cy };
  const center2: Point = { x: circle2.cx, y: circle2.cy };
  const lceaLeft = leftLceaDisplay(computeLcea(center1, lateralEdgeLeft));
  const lceaRight = computeLcea(center2, lateralEdgeRight);
  const categoryLeft = getLceaCategory(lceaLeft);
  const categoryRight = getLceaCategory(lceaRight);

  const markersPlaced =
    !(circle1.cx === 0 && circle1.cy === 0 && circle2.cx === 0 && circle2.cy === 0);

  useEffect(() => {
    if (dragging) return;
    if (!imageUrl || !markersPlaced) return;
    trackCalculatorUsed();
  }, [dragging, imageUrl, markersPlaced]);

  return (
    <div className="viewer-wrap">
      <div
        ref={containerRef}
        className="viewer-container"
        onMouseMove={onMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchMove={onMove}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
      >
        <img
          src={imageUrl}
          alt={t.xrayAlt}
          className="viewer-image"
          onLoad={handleImageLoad}
          draggable={false}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
        <svg
          className="viewer-overlay"
          viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="hipmetrics-watermark"
              width="280"
              height="150"
              patternUnits="userSpaceOnUse"
              patternTransform={`rotate(${WATERMARK_SVG_ROTATE})`}
            >
              <text
                x="0"
                y="72"
                fill="#ffffff"
                fillOpacity={WATERMARK_OPACITY}
                fontSize="15"
                fontFamily="Segoe UI, system-ui, sans-serif"
                fontWeight="600"
                letterSpacing="0.4"
              >
                {WATERMARK_TEXT}
              </text>
            </pattern>
            <marker
              id="arrowhead-left"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={LEFT_STROKE} />
            </marker>
            <marker
              id="arrowhead-right"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={RIGHT_STROKE} />
            </marker>
          </defs>

          <rect
            width={containerSize.w}
            height={containerSize.h}
            fill="url(#hipmetrics-watermark)"
            pointerEvents="none"
          />

          {/* Line connecting left and right femoral head centers */}
          <line
            x1={center1.x}
            y1={center1.y}
            x2={center2.x}
            y2={center2.y}
            stroke="rgba(160, 160, 160, 0.9)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          {/* Left: vertical through circle1 center */}
          <line
            x1={center1.x}
            y1={0}
            x2={center1.x}
            y2={containerSize.h}
            stroke={LEFT_STROKE}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.8}
          />
          {/* Left: center to lateral edge */}
          <line
            x1={center1.x}
            y1={center1.y}
            x2={lateralEdgeLeft.x}
            y2={lateralEdgeLeft.y}
            stroke={LEFT_STROKE}
            strokeWidth={2}
            markerEnd="url(#arrowhead-left)"
          />
          {/* Right: vertical through circle2 center */}
          <line
            x1={center2.x}
            y1={0}
            x2={center2.x}
            y2={containerSize.h}
            stroke={RIGHT_STROKE}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={0.8}
          />
          {/* Right: center to lateral edge */}
          <line
            x1={center2.x}
            y1={center2.y}
            x2={lateralEdgeRight.x}
            y2={lateralEdgeRight.y}
            stroke={RIGHT_STROKE}
            strokeWidth={2}
            markerEnd="url(#arrowhead-right)"
          />

          {/* Circle 1 - Left femoral head */}
          <circle
            cx={circle1.cx}
            cy={circle1.cy}
            r={circle1.r}
            fill="none"
            stroke={LEFT_STROKE}
            strokeWidth={2}
            className="draggable-circle"
          />
          {/* Circle 2 - Right femoral head */}
          <circle
            cx={circle2.cx}
            cy={circle2.cy}
            r={circle2.r}
            fill="none"
            stroke={RIGHT_STROKE}
            strokeWidth={2}
            className="draggable-circle"
          />
          {/* Left lateral edge dot */}
          <circle
            cx={lateralEdgeLeft.x}
            cy={lateralEdgeLeft.y}
            r={DOT_R}
            fill={LEFT_DOT}
            stroke={LEFT_STROKE}
            strokeWidth={1.5}
            className="draggable-dot"
          />
          {/* Right lateral edge dot */}
          <circle
            cx={lateralEdgeRight.x}
            cy={lateralEdgeRight.y}
            r={DOT_R}
            fill={RIGHT_DOT}
            stroke={RIGHT_STROKE}
            strokeWidth={1.5}
            className="draggable-dot"
          />
        </svg>
      </div>
      <div className="lcea-result">
        <div className="lcea-result-side">
          <span className="lcea-left">
            <strong>
              {t.leftLcea}: {lceaLeft}°
            </strong>
          </span>
          <span className="lcea-category">
            {t.status}: {t.categories[categoryLeft]}
          </span>
        </div>
        <div className="lcea-result-side">
          <span className="lcea-right">
            <strong>
              {t.rightLcea}: {lceaRight}°
            </strong>
          </span>
          <span className="lcea-category">
            {t.status}: {t.categories[categoryRight]}
          </span>
        </div>
      </div>
    </div>
  );
}
