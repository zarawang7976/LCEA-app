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

        <figure className="info-guide">
          <div className="info-guide-frame">
            <img src="/tutorial/landmarks.png" alt={info.guideImageAlt} />
            <svg className="info-guide-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <marker id="info-arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#1a1a1a" />
                </marker>
              </defs>
              <line
                x1="19.4"
                y1="13.5"
                x2="20.8"
                y2="50"
                stroke="#1a1a1a"
                strokeWidth="1.4"
                markerEnd="url(#info-arrowhead)"
              />
              <line
                x1="88"
                y1="16"
                x2="81.4"
                y2="44.2"
                stroke="#1a1a1a"
                strokeWidth="1.4"
                markerEnd="url(#info-arrowhead)"
              />
            </svg>
            <p className="info-guide-label info-guide-label-1">{info.guideStep1}</p>
            <p className="info-guide-label info-guide-label-2">{info.guideStep2}</p>
          </div>
        </figure>

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
