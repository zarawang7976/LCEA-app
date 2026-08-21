import { useCallback, useEffect, useRef, useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ImageViewer from "./components/ImageViewer";
import InfoScreen from "./components/InfoScreen";
import TopBar from "./components/TopBar";
import { trackPageView } from "./analytics";
import { useLanguage } from "./i18n/LanguageContext";
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
  const { t, locale } = useLanguage();
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
  const skipInitialPageView = useRef(true);

  useEffect(() => {
    if (skipInitialPageView.current) {
      skipInitialPageView.current = false;
      return;
    }
    const path = screen === "home" ? "/" : screen === "info" ? "/how-calculated" : "/measure";
    trackPageView(path);
  }, [screen]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError(t.errorChooseImage);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string);
      reader.onerror = () => setError(t.errorReadFile);
      reader.readAsDataURL(file);
      setCircle1(DEFAULT_CIRCLE);
      setCircle2(DEFAULT_CIRCLE);
      setLateralEdgeLeft(DEFAULT_POINT);
      setLateralEdgeRight(DEFAULT_POINT);
      e.target.value = "";
    },
    [t]
  );

  const handleLoadCase = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
        .catch((err) =>
          setError(err instanceof Error ? err.message : t.errorLoadCase)
        );
      e.target.value = "";
    },
    [t]
  );

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
      setError(t.errorNoImage);
      return;
    }
    saveCase(
      buildCase(imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight),
      undefined,
      containerSize ?? undefined
    );
    setError("");
  }, [imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight, containerSize, t]);

  const handleExportPdf = useCallback(() => {
    if (!imageUrl) {
      setError(t.errorNoImage);
      return;
    }
    const rect = viewerContainerRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) {
      setError(t.errorViewerSize);
      return;
    }
    const img = new Image();
    img.onload = () => {
      // jsPDF default fonts do not embed CJK glyphs; keep English labels for Chinese.
      const pdfLabels =
        locale === "zh"
          ? {
              left: "Left",
              right: "Right",
              leftLcea: "Left LCEA",
              rightLcea: "Right LCEA",
            }
          : {
              left: t.pdfLeft,
              right: t.pdfRight,
              leftLcea: t.pdfLeftLcea,
              rightLcea: t.pdfRightLcea,
            };
      exportToPdf(
        imageUrl,
        circle1,
        circle2,
        lateralEdgeLeft,
        lateralEdgeRight,
        { width: rect.width, height: rect.height },
        img.naturalWidth,
        img.naturalHeight,
        pdfLabels
      );
      setError("");
    };
    img.onerror = () => setError(t.errorPdfImage);
    img.src = imageUrl;
  }, [imageUrl, circle1, circle2, lateralEdgeLeft, lateralEdgeRight, t, locale]);

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
            {t.backHome}
          </button>
          <div className="measure-title-wrap">
            <h1 className="app-title">{t.appTitle}</h1>
            <p className="subtitle">{t.appSubtitle}</p>
          </div>
        </header>

        <div className="toolbar">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden-input"
            id="upload-input"
            aria-label={t.uploadAria}
          />
          <label htmlFor="upload-input" className="btn btn-primary">
            {t.uploadXray}
          </label>
          <input
            type="file"
            accept=".lcea,application/json"
            onChange={handleLoadCase}
            className="hidden-input"
            id="load-input"
            aria-label={t.loadAria}
          />
          <label htmlFor="load-input" className="btn">
            {t.loadCase}
          </label>
          <button type="button" className="btn" onClick={handleSaveCase} disabled={!imageUrl}>
            {t.saveCase}
          </button>
          <button type="button" className="btn" onClick={handleExportPdf} disabled={!imageUrl}>
            {t.exportPdf}
          </button>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {!imageUrl ? (
          <div className="placeholder">
            <p>{t.placeholderTitle}</p>
            <p>{t.placeholderHint}</p>
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
