import { useLanguage } from "../i18n/LanguageContext";

export default function HomeScreen({
  onHowCalculated,
  onStartMeasuring,
}: {
  onHowCalculated: () => void;
  onStartMeasuring: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">{t.appTitle}</h1>
        <p className="home-subtitle">{t.appSubtitle}</p>
      </div>
      <div className="home-actions">
        <button type="button" className="home-btn home-btn-secondary" onClick={onHowCalculated}>
          {t.howCalculated}
        </button>
        <button type="button" className="home-btn home-btn-primary" onClick={onStartMeasuring}>
          {t.measureXray}
        </button>
      </div>
    </div>
  );
}
