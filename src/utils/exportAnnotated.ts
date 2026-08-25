import { jsPDF } from "jspdf";
import type { CircleMarker, Point } from "../types";
import { computeLcea, leftLceaDisplay } from "../types";
import { drawWatermarkOnCanvas } from "./watermark";

export type ExportFormat = "png" | "jpeg" | "pdf";

const DOT_R = 5;
const LEFT_RGB = { r: 192, g: 167, b: 211 };
const RIGHT_RGB = { r: 167, g: 211, b: 184 };
const FONT_SIZE_LABEL = 18;
const FONT_SIZE_SUMMARY = 18;
const JPEG_QUALITY = 0.92;

const INTERPRETATION_LINES = [
  "< 20° — Often considered dysplastic; the socket may provide insufficient coverage (hip dysplasia).",
  "20°–25° — Borderline; may warrant follow-up or context from other findings.",
  "25°–39° — Generally normal coverage for adults.",
  "≥ 40° — Increased coverage; can be associated with pincer-type morphology or overcoverage.",
];

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      if (ctx.measureText(word).width <= maxWidth) {
        current = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          const next = chunk + ch;
          if (ctx.measureText(next).width <= maxWidth) chunk = next;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
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
  imageHeight: number;
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
  const guideBodyFont = Math.max(11, summaryFont * 0.58);
  const guideLineHeight = guideBodyFont * 1.35;
  const footerPad = summaryFont * 0.55;
  const labelY = labelFont;

  const measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) throw new Error("Canvas 2D context unavailable");
  const textMaxWidth = naturalWidth - footerPad * 2;
  measureCtx.font = `${guideBodyFont}px Helvetica, Arial, sans-serif`;
  const wrappedGuide = INTERPRETATION_LINES.flatMap((line) =>
    wrapText(measureCtx, `• ${line}`, textMaxWidth)
  );
  const summaryBlock = summaryFont * 3.2;
  const guideGap = summaryFont;
  const guideBlock = wrappedGuide.length * guideLineHeight + footerPad;
  const footerH = summaryBlock + guideGap + guideBlock;

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
  ctx.fillStyle = rgb(LEFT_RGB);
  ctx.fillText(`${leftLabel}: ${lceaLeft}°`, c1.x - 32 * rScale, labelY);
  ctx.fillStyle = rgb(RIGHT_RGB);
  ctx.fillText(`${rightLabel}: ${lceaRight}°`, c2.x + 6 * rScale, labelY);

  const summaryY1 = naturalHeight + summaryFont * 1.15;
  const summaryY2 = naturalHeight + summaryFont * 2.35;
  ctx.font = `${summaryFont}px Helvetica, Arial, sans-serif`;
  ctx.fillStyle = rgb(LEFT_RGB);
  ctx.fillText(`${leftLceaLabel}: ${lceaLeft}°`, footerPad, summaryY1);
  ctx.fillStyle = rgb(RIGHT_RGB);
  ctx.fillText(`${rightLceaLabel}: ${lceaRight}°`, footerPad, summaryY2);

  let guideY = naturalHeight + summaryFont * 3.15 + guideGap;
  ctx.font = `${guideBodyFont}px Helvetica, Arial, sans-serif`;
  ctx.fillStyle = "#333333";
  for (const line of wrappedGuide) {
    ctx.fillText(line, footerPad, guideY);
    guideY += guideLineHeight;
  }

  return { canvas, lceaLeft, lceaRight, imageHeight: naturalHeight };
}

function savePdfFromCanvas(
  canvas: HTMLCanvasElement,
  imageHeight: number,
  lceaLeft: number,
  lceaRight: number
): void {
  const imageWidth = canvas.width;
  const probe = new jsPDF({
    orientation: imageWidth > imageHeight ? "landscape" : "portrait",
    unit: "px",
  });
  const pageW = probe.internal.pageSize.getWidth();
  const pageH = probe.internal.pageSize.getHeight();
  const imgScale = Math.min(pageW / imageWidth, pageH / imageHeight);
  const drawnW = imageWidth * imgScale;
  const drawnH = canvas.height * imgScale;
  const pdf = new jsPDF({
    orientation: drawnW >= drawnH ? "landscape" : "portrait",
    unit: "px",
    format: [drawnW, drawnH],
  });
  const dataUrl = canvas.toDataURL("image/png");
  pdf.addImage(dataUrl, "PNG", 0, 0, drawnW, drawnH);
  pdf.save(exportFilename(lceaLeft, lceaRight, "pdf"));
}

export async function exportAnnotated(params: ExportParams): Promise<void> {
  const { canvas, lceaLeft, lceaRight, imageHeight } = await renderAnnotatedCanvas(params);

  if (params.format === "pdf") {
    savePdfFromCanvas(canvas, imageHeight, lceaLeft, lceaRight);
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
