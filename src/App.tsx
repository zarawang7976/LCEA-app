import { useCallback, useEffect, useRef, useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ImageViewer from "./components/ImageViewer";
import InfoScreen from "./components/InfoScreen";
import TopBar from "./components/TopBar";
import type { CircleMarker, LceaCase, Point } from "./types";
import { exportToPdf } from "./utils/pdfExport";
import { loadCase as loadCaseFile, saveCase, scaleMarkersToContainer } from "./utils/saveLoad";
import "./App.css";

type Screen = "home" | "info" | "measure";

const DEFAULT_CIRCLE: CircleMarker = { cx: 0, cy: 0, r: 24 };
const DEFAULT_POINT: Point = { x: 0, y: 0 };

function buildCase(
  imageDataUrl: string,
  circle1: CircleMarker,
  circle2: CircleMarker,
  lateralEdgeLeft: Point,
  lateralEdgeRight: Point,
  label?: string
): LceaCase {
  return {
    imageDataUrl,
    circle1,
    circle2,
    lateralEdgeLeft,
    lateralEdgeRight,
    createdAt: new Date().toISOString(),
    label,
  };
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [imageUrl, setImageUrl] = useState("");
  const [circle1, setCircle1] = useState<CircleMarker>(DEFAULT_CIRCLE);
  const [circle2, setCircle2] = useState<CircleMarker>(DEFAULT_CIRCLE);
  const [lateralEdgeLeft, setLateralEdgeLeft] = useState<Point>(DEFAULT_POINT);
  const [lateralEdgeRight, setLateralEdgeRight] = useState<Point>(DEFAULT_POINT);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [loadedCase, setLoadedCase] = useState<LceaCase | null>(null);
  const [error, setError] = useState("");
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPEG or PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
    setCircle1(DEFAULT_CIRCLE);
    setCircle2(DEFAULT_CIRCLE);
    setLateralEdgeLeft(DEFAULT_POINT);
    setLateralEdgeRight(DEFAULT_POINT);
    e.target.value = "";
  }, []);

  const handleLoadCase = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    loadCaseFile(file)
      .then((data) => {
        setImageUrl(data.imageDataUrl);
        setCircle1(data.circle1);
        setCircle2(data.circle2);
        setLateralEdgeLeft(data.lateralEdgeLeft);
        setLateralEdgeRight(data.lateralEdgeRight);
        setLoadedCase(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load case."));
    e.target.value = "";
  }, []);

  useEffect(() => {
    if (!loadedCase?.containerWidth || !containerSize) return;
    const scaled = scaleMarkersToContainer(loadedCase, containerSize);
    setCircle1(scaled.circle1);
    setCircle2(scaled.circle2);
    setLateralEdgeLeft(scaled.lateralEdgeLeft);
    setLateralEdgeRight(scaled.lateralEdgeRight);
    setLoadedCase(null);
  }, [loadedCase, containerSize]);

  const handleSaveCase = useCallback(() => {
    if (!imageUrl) {
      setError("No image loaded.");
      return;
    }
    saveCase(
      buildCase(imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight),
      undefined,
      containerSize ?? undefined
    );
    setError("");
  }, [imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight, containerSize]);

  const handleExportPdf = useCallback(() => {
    if (!imageUrl) {
      setError("No image loaded.");
      return;
    }
    const rect = viewerContainerRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) {
      setError("Viewer size unknown. Try resizing the window and export again.");
      return;
    }
    const img = new Image();
    img.onload = () => {
      exportToPdf(
        imageUrl,
        circle1,
        circle2,
        lateralEdgeLeft,
        lateralEdgeRight,
        { width: rect.width, height: rect.height },
        img.naturalWidth,
        img.naturalHeight
      );
      setError("");
    };
    img.onerror = () => setError("Failed to prepare image for PDF.");
    img.src = imageUrl;
  }, [imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight]);

  if (screen === "home") {
    return (
      <>
        <TopBar />
        <div className="app app-home">
          <HomeScreen
            onHowCalculated={() => setScreen("info")}
            onStartMeasuring={() => setScreen("measure")}
          />
        </div>
      </>
    );
  }

  if (screen === "info") {
    return (
      <>
        <TopBar />
        <div className="app">
          <InfoScreen onBack={() => setScreen("home")} />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="app">
        <header className="app-header measure-header">
        <button type="button" className="back-btn" onClick={() => setScreen("home")}>
          ← Back to home
        </button>
        <div className="measure-title-wrap">
          <h1 className="app-title">LCEA Calculator</h1>
          <p className="subtitle">Lateral Center Edge Angle from hip X-ray</p>
        </div>
      </header>

      <div className="toolbar">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden-input"
          id="upload-input"
          aria-label="Upload X-ray image"
        />
        <label htmlFor="upload-input" className="btn btn-primary">
          Upload X-ray
        </label>
        <input
          type="file"
          accept=".lcea,application/json"
          onChange={handleLoadCase}
          className="hidden-input"
          id="load-input"
          aria-label="Load saved case"
        />
        <label htmlFor="load-input" className="btn">
          Load case
        </label>
        <button type="button" className="btn" onClick={handleSaveCase} disabled={!imageUrl}>
          Save case
        </button>
        <button type="button" className="btn" onClick={handleExportPdf} disabled={!imageUrl}>
          Export PDF
        </button>
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {!imageUrl ? (
        <div className="placeholder">
          <p>Upload an X-ray image (JPEG or PNG) to start.</p>
          <p>
            Place two circles on left and right femoral heads (drag edge to resize). Place the purple
            dot on the left lateral acetabulum and the green dot on the right.
          </p>
        </div>
      ) : (
        <ImageViewer
          imageUrl={imageUrl}
          circle1={circle1}
          circle2={circle2}
          lateralEdgeLeft={lateralEdgeLeft}
          lateralEdgeRight={lateralEdgeRight}
          onCircle1Change={setCircle1}
          onCircle2Change={setCircle2}
          onLateralEdgeLeftChange={setLateralEdgeLeft}
          onLateralEdgeRightChange={setLateralEdgeRight}
          onContainerSize={setContainerSize}
          containerRef={viewerContainerRef}
        />
      )}
      </div>
    </>
  );
}

export default App;
