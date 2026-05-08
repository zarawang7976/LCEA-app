# LCEA Calculator

Measure **Lateral Center Edge Angle** from a hip X-ray: upload an image (JPEG/PNG), place two circles on the femoral head and one dot on the lateral edge of the acetabulum. The app computes the angle and lets you save cases and export a PDF.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder with any static host (e.g. `npx serve dist`) or deploy to a web server.

## Usage

1. **Upload X-ray** – Choose a JPEG or PNG (e.g. exported from DICOM).
2. **Place markers** – Two cyan circles are placed on the femoral head; drag them to fit. Drag the red dot to the lateral edge of the acetabulum.
3. **LCEA** – Shown live. Vertical line = through head center; angled line = center to lateral edge.
4. **Save case** – Downloads a `.lcea` file (JSON + embedded image) so you can reopen later.
5. **Load case** – Pick a `.lcea` file to restore image and markers (positions scale if the window size changed).
6. **Export PDF** – Downloads a PDF with the image, overlay, and LCEA value.

## Later: native apps and desktop

- **Android / iOS (Play Store / App Store)**  
  Wrap this app with [Capacitor](https://capacitorjs.com/): same codebase, native shell. Add the Capacitor CLI, run `npx cap add android` / `npx cap add ios`, then build and submit.

- **Windows .exe**  
  Wrap the built `dist/` in [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) to ship a desktop executable.

- **Offline**  
  Add a service worker (e.g. Vite PWA plugin) so the app works without internet after the first load.

## Tech

- React 19 + TypeScript + Vite
- jsPDF for PDF export
- No backend; everything runs in the browser
