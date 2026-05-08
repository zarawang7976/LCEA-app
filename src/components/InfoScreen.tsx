export default function InfoScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="info-page">
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back to home
      </button>
      <div className="info-content">
        <h2>How the LCEA is calculated</h2>

        <section>
          <h3>What is the femoral head?</h3>
          <p>
            The <strong>femoral head</strong> is the rounded, ball-like top of the thigh bone (femur)
            that sits inside the hip socket. On an anteroposterior (AP) pelvic or hip X-ray, you see
            it as a circle on each side. In this app, you fit a circle to each femoral head so we
            can find its center.
          </p>
        </section>

        <section>
          <h3>What is the lateral acetabulum?</h3>
          <p>
            The <strong>acetabulum</strong> is the cup-shaped socket of the hip bone that holds the
            femoral head. The <strong>lateral edge of the acetabulum</strong> is the outer, superior
            rim of that socket—often referred to as the “sourcil” or roof of the acetabulum on X-ray.
            You place a dot on this lateral edge for each hip so we can measure the angle.
          </p>
        </section>

        <section>
          <h3>How is the angle calculated?</h3>
          <p>
            The <strong>Lateral Center Edge Angle (LCEA)</strong> is measured on an AP pelvic/hip
            X-ray. For each hip:
          </p>
          <ul>
            <li>
              A <strong>vertical line</strong> is drawn straight down through the center of the
              femoral head.
            </li>
            <li>
              A <strong>second line</strong> is drawn from the center of the femoral head to the
              lateral edge of the acetabulum (your dot).
            </li>
            <li>
              The <strong>LCEA</strong> is the angle between these two lines. It reflects how much
              the socket covers the top and side of the femoral head.
            </li>
          </ul>
        </section>

        <section>
          <h3>What do the angle ranges mean?</h3>
          <p>Interpretation is typically based on the measured angle (in degrees):</p>
          <ul className="info-ranges">
            <li>
              <strong>&lt; 20°</strong> — Often considered <strong>dysplastic</strong>; the socket
              may provide insufficient coverage (hip dysplasia).
            </li>
            <li>
              <strong>20°–25°</strong> — <strong>Borderline</strong>; may warrant follow-up or
              context from other findings.
            </li>
            <li>
              <strong>25°–39°</strong> — Generally <strong>normal</strong> coverage for adults.
            </li>
            <li>
              <strong>≥ 40°</strong> — <strong>Increased coverage</strong>; can be associated with
              pincer-type morphology or overcoverage.
            </li>
          </ul>
          <p>
            These ranges are guidelines. Interpretation should be done by a qualified clinician in
            the context of the full image and clinical picture.
          </p>
        </section>
      </div>
    </div>
  );
}
