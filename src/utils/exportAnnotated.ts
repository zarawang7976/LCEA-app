import { jsPDF } from "jspdf";
import type { CircleMarker, Point } from "../types";
import { computeLcea, leftLceaDisplay } from "../types";
import { drawWatermarkOnCanvas } from "./watermark";

export type ExportFormat = "png" | "jpeg" | "pdf";

const DOT_R = 5;
const LEFT_RGB = { r: 192, g: 167, b: 211 };
const RIGHT_RGB = { r: 167, g: 211, b: 184 };
const LEFT_TEXT_RGB = { r: 74, g: 64, b: 85 };
const RIGHT_TEXT_RGB = { r: 53, g: 74, b: 61 };
const FONT_SIZE_LABEL = 18;
const FONT_SIZE_SUMMARY = 18;
const JPEG_QUALITY = 0.92;

export interface ExportLabels {
  left: string;
  right: string;
  leftLcea: string;
  rightLcea: string;
}

export interface ExportParams {
  format: ExportFormat;
  imageDataUrl: string;
  circle1: CircleMarker;
  circle2: CircleMarker;
  lateralEdgeLeft: Point;
  lateralEdgeRight: Point;
  containerRect: { width: number; height: number };
  labels?: ExportLabels;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function rgb(c: { r: number; g: number; b: number }): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function strokeCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash: number[]
): void {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawSolidLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image"));
      },
      type,
      quality
    );
  });
}

export function exportFilename(lceaLeft: number, lceaRight: number, ext: string): string {
  return `LCEA-L${lceaLeft}-R${lceaRight}-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

/**
 * Rasterize the annotated X-ray (image + watermark + measurements + summary)
 * at natural image resolution. Used for PNG, JPEG, and PDF so all match.
 */
export async function renderAnnotatedCanvas(params: Omit<ExportParams, "format">): Promise<{
  canvas: HTMLCanvasElement;
  lceaLeft: number;
  lceaRight: number;
}> {
  const img = await loadImage(params.imageDataUrl);
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const { circle1, circle2, lateralEdgeLeft, lateralEdgeRight, containerRect } = params;

  const scale = Math.min(containerRect.width / naturalWidth, containerRect.height / naturalHeight);
  const contentW = naturalWidth * scale;
  const contentH = naturalHeight * scale;
  const left = (containerRect.width - contentW) / 2;
  const top = (containerRect.height - contentH) / 2;

  const toImageCoords = (cx: number, cy: number) => ({
    x: (cx - left) / scale,
    y: (cy - top) / scale,
  });

  const c1 = toImageCoords(circle1.cx, circle1.cy);
  const c2 = toImageCoords(circle2.cx, circle2.cy);
  const latL = toImageCoords(lateralEdgeLeft.x, lateralEdgeLeft.y);
  const latR = toImageCoords(lateralEdgeRight.x, lateralEdgeRight.y);
  const lceaLeft = leftLceaDisplay(computeLcea({ x: c1.x, y: c1.y }, latL));
  const lceaRight = computeLcea({ x: c2.x, y: c2.y }, latR);

  const rScale = 1 / scale;
  const lineW = 2 * rScale;
  const dashLong = 6 * rScale;
  const dashShort = 4 * rScale;
  const labelFont = FONT_SIZE_LABEL * rScale;
  const summaryFont = FONT_SIZE_SUMMARY * rScale;
  const footerH = summaryFont * 3.2;
  const labelY = labelFont;

  const canvas = document.createElement("canvas");
  canvas.width = naturalWidth;
  canvas.height = Math.ceil(naturalHeight + footerH);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
  drawWatermarkOnCanvas(ctx, 0, 0, naturalWidth, naturalHeight);

  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.lineWidth = lineW;

  ctx.strokeStyle = "rgb(160, 160, 160)";
  drawDashedLine(ctx, c1.x, c1.y, c2.x, c2.y, [dashLong, dashShort]);

  ctx.strokeStyle = rgb(LEFT_RGB);
  strokeCircle(ctx, c1.x, c1.y, circle1.r * rScale);
  strokeCircle(ctx, latL.x, latL.y, DOT_R * rScale);
  drawDashedLine(ctx, c1.x, 0, c1.x, naturalHeight, [dashShort, dashShort]);
  drawSolidLine(ctx, c1.x, c1.y, latL.x, latL.y);

  ctx.strokeStyle = rgb(RIGHT_RGB);
  strokeCircle(ctx, c2.x, c2.y, circle2.r * rScale);
  strokeCircle(ctx, latR.x, latR.y, DOT_R * rScale);
  drawDashedLine(ctx, c2.x, 0, c2.x, naturalHeight, [dashShort, dashShort]);
  drawSolidLine(ctx, c2.x, c2.y, latR.x, latR.y);

  const leftLabel = params.labels?.left ?? "Left";
  const rightLabel = params.labels?.right ?? "Right";
  const leftLceaLabel = params.labels?.leftLcea ?? "Left LCEA";
  const rightLceaLabel = params.labels?.rightLcea ?? "Right LCEA";

  ctx.font = `${labelFont}px Helvetica, Arial, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = rgb(LEFT_TEXT_RGB);
  ctx.fillText(`${leftLabel}: ${lceaLeft}°`, c1.x - 32 * rScale, labelY);
  ctx.fillStyle = rgb(RIGHT_TEXT_RGB);
  ctx.fillText(`${rightLabel}: ${lceaRight}°`, c2.x + 6 * rScale, labelY);

  const summaryY1 = naturalHeight + summaryFont * 1.15;
  const summaryY2 = naturalHeight + summaryFont * 2.35;
  ctx.font = `${summaryFont}px Helvetica, Arial, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.fillText(`${leftLceaLabel}: ${lceaLeft}°`, 0, summaryY1);
  ctx.fillText(`${rightLceaLabel}: ${lceaRight}°`, 0, summaryY2);

  return { canvas, lceaLeft, lceaRight };
}

function savePdfFromCanvas(
  canvas: HTMLCanvasElement,
  lceaLeft: number,
  lceaRight: number
): void {
  const naturalWidth = canvas.width;
  const naturalHeight = canvas.height;
  const pdf = new jsPDF({
    orientation: naturalWidth > naturalHeight ? "landscape" : "portrait",
    unit: "px",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgScale = Math.min(pageW / naturalWidth, pageH / naturalHeight);
  const imgW = naturalWidth * imgScale;
  const imgH = naturalHeight * imgScale;
  const imgX = (pageW - imgW) / 2;
  const imgY = (pageH - imgH) / 2;
  const dataUrl = canvas.toDataURL("image/png");
  pdf.addImage(dataUrl, "PNG", imgX, imgY, imgW, imgH);
  pdf.save(exportFilename(lceaLeft, lceaRight, "pdf"));
}

export async function exportAnnotated(params: ExportParams): Promise<void> {
  const { canvas, lceaLeft, lceaRight } = await renderAnnotatedCanvas(params);

  if (params.format === "pdf") {
    savePdfFromCanvas(canvas, lceaLeft, lceaRight);
    return;
  }

  const mime = params.format === "png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(
    canvas,
    mime,
    params.format === "jpeg" ? JPEG_QUALITY : undefined
  );
  const url = URL.createObjectURL(blob);
  triggerDownload(url, exportFilename(lceaLeft, lceaRight, params.format === "png" ? "png" : "jpg"));
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
