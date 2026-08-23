import { GState, type jsPDF } from "jspdf";

export const WATERMARK_TEXT = "HipMetrics | hipmetrics.org";
/** Screen/SVG: negative = up-right diagonal. */
export const WATERMARK_SVG_ROTATE = -32;
/** jsPDF text angle in degrees (counterclockwise). */
export const WATERMARK_PDF_ANGLE = 32;
export const WATERMARK_OPACITY = 0.15;

export interface WatermarkLayout {
  fontSize: number;
  positions: { x: number; y: number }[];
}

/** Shared tile grid for on-export watermark (PDF, PNG, JPEG). */
export function getWatermarkLayout(
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number
): WatermarkLayout {
  const fontSize = Math.max(10, Math.min(imgW, imgH) * 0.028);
  const stepX = fontSize * 16;
  const stepY = fontSize * 7.5;
  const positions: { x: number; y: number }[] = [];
  for (let y = imgY + stepY * 0.35; y < imgY + imgH - fontSize; y += stepY) {
    for (let x = imgX + fontSize; x < imgX + imgW - fontSize; x += stepX) {
      positions.push({ x, y });
    }
  }
  return { fontSize, positions };
}

export function drawWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number
): void {
  const { fontSize, positions } = getWatermarkLayout(imgX, imgY, imgW, imgH);
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${WATERMARK_OPACITY})`;
  ctx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const radians = (-WATERMARK_PDF_ANGLE * Math.PI) / 180;
  for (const { x, y } of positions) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.fillText(WATERMARK_TEXT, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Tiled diagonal watermark over the X-ray on the PDF page.
 * Does not alter the source image data URL.
 */
export function drawWatermarkOnPdf(
  pdf: jsPDF,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number
): void {
  const { fontSize, positions } = getWatermarkLayout(imgX, imgY, imgW, imgH);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(255, 255, 255);
  pdf.setGState(new GState({ opacity: WATERMARK_OPACITY }));

  for (const { x, y } of positions) {
    pdf.text(WATERMARK_TEXT, x, y, { angle: WATERMARK_PDF_ANGLE, baseline: "middle" });
  }

  pdf.setGState(new GState({ opacity: 1 }));
  pdf.setTextColor(0, 0, 0);
}
