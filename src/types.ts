export interface Point {
  x: number;
  y: number;
}

export interface CircleMarker {
  cx: number;
  cy: number;
  r: number;
}

export interface LceaCase {
  imageDataUrl: string;
  circle1: CircleMarker;
  circle2: CircleMarker;
  lateralEdgeLeft: Point;
  lateralEdgeRight: Point;
  createdAt: string;
  label?: string;
  /** Optional: used to scale markers when loading on a different screen size */
  containerWidth?: number;
  containerHeight?: number;
}

/** LCEA in degrees: angle between vertical (through head center) and line from center to lateral edge. */
export function computeLcea(center: Point, lateral: Point): number {
  const dx = lateral.x - center.x;
  const dy = lateral.y - center.y;
  if (Math.abs(dx) < 1e-6) return 0;
  const angleRad = Math.atan2(dx, -dy);
  let deg = (angleRad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return Math.round(deg * 10) / 10;
}

/** Left hip: display as 360° minus computed angle. */
export function leftLceaDisplay(angleDeg: number): number {
  return Math.round(((360 - angleDeg) % 360) * 10) / 10;
}

/** Category key for display; matches "How the angle is calculated" ranges. */
export type LceaCategoryKey = "dysplastic" | "borderline" | "normal" | "increasedCoverage";

export function getLceaCategory(angleDeg: number): LceaCategoryKey {
  if (angleDeg < 20) return "dysplastic";
  if (angleDeg < 25) return "borderline";
  if (angleDeg < 40) return "normal";
  return "increasedCoverage";
}
