export default function HomeScreen({
  onHowCalculated,
  onStartMeasuring,
}: {
  onHowCalculated: () => void;
  onStartMeasuring: () => void;
}) {
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">LCEA Calculator</h1>
        <p className="home-subtitle">Lateral Center Edge Angle from hip X-ray</p>
      </div>
      <div className="home-actions">
        <button type="button" className="home-btn home-btn-secondary" onClick={onHowCalculated}>
          How the angle is calculated
        </button>
        <button type="button" className="home-btn home-btn-primary" onClick={onStartMeasuring}>
          Measure an X-ray
        </button>
      </div>
    </div>
  );
}
