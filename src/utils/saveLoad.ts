import type { LceaCase, Point } from "../types";

const FILE_EXT = ".lcea";

export function saveCase(
  caseData: LceaCase,
  filename?: string,
  containerSize?: { w: number; h: number }
): void {
  const toSave: LceaCase = containerSize
    ? { ...caseData, containerWidth: containerSize.w, containerHeight: containerSize.h }
    : caseData;
  const name =
    filename ?? `LCEA-case-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}${FILE_EXT}`;
  const blob = new Blob([JSON.stringify(toSave, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function scaleMarkersToContainer(
  caseData: LceaCase,
  containerSize: { w: number; h: number }
): Pick<LceaCase, "circle1" | "circle2" | "lateralEdgeLeft" | "lateralEdgeRight"> {
  const sw = caseData.containerWidth ?? containerSize.w;
  const sh = caseData.containerHeight ?? containerSize.h;
  const sx = containerSize.w / sw;
  const sy = containerSize.h / sh;
  const scalePt = (p: { x: number; y: number }) => ({ x: p.x * sx, y: p.y * sy });
  return {
    circle1: { ...caseData.circle1, cx: caseData.circle1.cx * sx, cy: caseData.circle1.cy * sy },
    circle2: { ...caseData.circle2, cx: caseData.circle2.cx * sx, cy: caseData.circle2.cy * sy },
    lateralEdgeLeft: scalePt(caseData.lateralEdgeLeft),
    lateralEdgeRight: scalePt(caseData.lateralEdgeRight),
  };
}

export function loadCase(file: File): Promise<LceaCase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as LceaCase & { lateralEdge?: Point };
        if (!data.imageDataUrl || !data.circle1 || !data.circle2) {
          reject(new Error("Invalid LCEA case file: missing required fields."));
          return;
        }
        if (!data.lateralEdgeLeft || !data.lateralEdgeRight) {
          const single = data.lateralEdge ?? data.lateralEdgeLeft ?? data.lateralEdgeRight;
          if (!single) {
            reject(new Error("Invalid LCEA case file: missing lateral edge point(s)."));
            return;
          }
          data.lateralEdgeLeft = single;
          data.lateralEdgeRight = single;
        }
        resolve(data as LceaCase);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
