import { jsPDF } from "jspdf";
import type { CircleMarker, Point } from "../types";
import { computeLcea, leftLceaDisplay } from "../types";

const DOT_R = 5;
const LEFT_RGB = { r: 192, g: 167, b: 211 };
const RIGHT_RGB = { r: 167, g: 211, b: 184 };
const LEFT_TEXT_RGB = { r: 74, g: 64, b: 85 };
const RIGHT_TEXT_RGB = { r: 53, g: 74, b: 61 };
const FONT_SIZE_LABEL = 18;
const FONT_SIZE_SUMMARY = 18;

export function exportToPdf(
  imageDataUrl: string,
  circle1: CircleMarker,
  circle2: CircleMarker,
  lateralEdgeLeft: Point,
  lateralEdgeRight: Point,
  containerRect: { width: number; height: number },
  naturalWidth: number,
  naturalHeight: number,
  labels?: {
    left: string;
    right: string;
    leftLcea: string;
    rightLcea: string;
  }
): void {
  const scale = Math.min(
    containerRect.width / naturalWidth,
    containerRect.height / naturalHeight
  );
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

  const imgFormat = imageDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
  pdf.addImage(imageDataUrl, imgFormat, imgX, imgY, imgW, imgH);

  const toPdf = (x: number, y: number) => ({
    x: imgX + x * imgScale,
    y: imgY + y * imgScale,
  });
  const scaleR = imgScale / scale;
  const r1 = toPdf(c1.x, c1.y);
  const r2 = toPdf(c2.x, c2.y);
  const rlatL = toPdf(latL.x, latL.y);
  const rlatR = toPdf(latR.x, latR.y);

  pdf.setLineWidth(2);
  pdf.setDrawColor(160, 160, 160);
  pdf.setLineDashPattern([6, 4], 0);
  pdf.line(r1.x, r1.y, r2.x, r2.y);
  pdf.setLineDashPattern([], 0);

  pdf.setDrawColor(LEFT_RGB.r, LEFT_RGB.g, LEFT_RGB.b);
  pdf.circle(r1.x, r1.y, circle1.r * scaleR);
  pdf.circle(rlatL.x, rlatL.y, DOT_R * scaleR);
  pdf.setLineDashPattern([4, 4], 0);
  pdf.line(r1.x, imgY, r1.x, imgY + imgH);
  pdf.setLineDashPattern([], 0);
  pdf.line(r1.x, r1.y, rlatL.x, rlatL.y);

  pdf.setDrawColor(RIGHT_RGB.r, RIGHT_RGB.g, RIGHT_RGB.b);
  pdf.circle(r2.x, r2.y, circle2.r * scaleR);
  pdf.circle(rlatR.x, rlatR.y, DOT_R * scaleR);
  pdf.setLineDashPattern([4, 4], 0);
  pdf.line(r2.x, imgY, r2.x, imgY + imgH);
  pdf.setLineDashPattern([], 0);
  pdf.line(r2.x, r2.y, rlatR.x, rlatR.y);

  const labelY = imgY + 18;
  const leftLabel = labels?.left ?? "Left";
  const rightLabel = labels?.right ?? "Right";
  const leftLceaLabel = labels?.leftLcea ?? "Left LCEA";
  const rightLceaLabel = labels?.rightLcea ?? "Right LCEA";
  pdf.setFontSize(FONT_SIZE_LABEL);
  pdf.setTextColor(LEFT_TEXT_RGB.r, LEFT_TEXT_RGB.g, LEFT_TEXT_RGB.b);
  pdf.text(`${leftLabel}: ${lceaLeft}°`, r1.x - 32, labelY);
  pdf.setTextColor(RIGHT_TEXT_RGB.r, RIGHT_TEXT_RGB.g, RIGHT_TEXT_RGB.b);
  pdf.text(`${rightLabel}: ${lceaRight}°`, r2.x + 6, labelY);

  pdf.setFontSize(FONT_SIZE_SUMMARY);
  pdf.setTextColor(0, 0, 0);
  const summaryY = imgY + imgH + 20;
  pdf.text(`${leftLceaLabel}: ${lceaLeft}°`, imgX, summaryY);
  pdf.text(`${rightLceaLabel}: ${lceaRight}°`, imgX, summaryY + 18);

  pdf.save(
    `LCEA-L${lceaLeft}-R${lceaRight}-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
