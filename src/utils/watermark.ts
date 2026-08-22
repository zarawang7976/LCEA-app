import { GState, type jsPDF } from "jspdf";

export const WATERMARK_TEXT = "HipMetrics | hipmetrics.org";
/** Screen/SVG: negative = up-right diagonal. */
export const WATERMARK_SVG_ROTATE = -32;
/** jsPDF text angle in degrees. */
export const WATERMARK_PDF_ANGLE = 32;
export const WATERMARK_OPACITY = 0.15;

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
  const fontSize = Math.max(10, Math.min(imgW, imgH) * 0.028);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(255, 255, 255);
  pdf.setGState(new GState({ opacity: WATERMARK_OPACITY }));

  const stepX = fontSize * 16;
  const stepY = fontSize * 7.5;

  for (let y = imgY + stepY * 0.35; y < imgY + imgH - fontSize; y += stepY) {
    for (let x = imgX + fontSize; x < imgX + imgW - fontSize; x += stepX) {
      pdf.text(WATERMARK_TEXT, x, y, { angle: WATERMARK_PDF_ANGLE, baseline: "middle" });
    }
  }

  pdf.setGState(new GState({ opacity: 1 }));
  pdf.setTextColor(0, 0, 0);
}
