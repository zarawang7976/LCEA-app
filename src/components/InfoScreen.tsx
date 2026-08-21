import { useLanguage } from "../i18n/LanguageContext";

export default function InfoScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const info = t.info;

  return (
    <div className="info-page">
      <button type="button" className="back-btn" onClick={onBack}>
        {t.backHome}
      </button>
      <div className="info-content">
        <h2>{info.title}</h2>

        <section>
          <h3>{info.femoralHeadTitle}</h3>
          <p>{info.femoralHeadBody}</p>
        </section>

        <section>
          <h3>{info.acetabulumTitle}</h3>
          <p>{info.acetabulumBody}</p>
        </section>

        <section>
          <h3>{info.angleTitle}</h3>
          <p>{info.angleIntro}</p>
          <ul>
            <li>{info.angleVertical}</li>
            <li>{info.angleSecond}</li>
            <li>{info.angleResult}</li>
          </ul>
        </section>

        <section>
          <h3>{info.rangesTitle}</h3>
          <p>{info.rangesIntro}</p>
          <ul className="info-ranges">
            <li>{info.rangeDysplastic}</li>
            <li>{info.rangeBorderline}</li>
            <li>{info.rangeNormal}</li>
            <li>{info.rangeIncreased}</li>
          </ul>
          <p>{info.disclaimer}</p>
        </section>
      </div>
    </div>
  );
}
