const steps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We begin with a deep conversation about your lifestyle, preferences, and aspirations. Every great design starts with understanding.",
  },
  {
    number: "02",
    title: "Concept",
    description:
      "Our team develops mood boards, spatial plans, and 3D renderings that bring the vision to life before any physical work begins.",
  },
  {
    number: "03",
    title: "Development",
    description:
      "Detailed drawings, material selections, and procurement. We refine every element until it perfectly aligns with the concept.",
  },
  {
    number: "04",
    title: "Delivery",
    description:
      "Full project management through installation and styling. We oversee every detail to ensure a flawless final result.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      style={{
        backgroundColor: "#1A1A1A",
        padding: "6rem 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C4A882",
              marginBottom: "1rem",
            }}
          >
            How We Work
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 300,
              color: "#FFFFFF",
            }}
          >
            Our design process
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}
          className="process-grid"
        >
          {steps.map((step, i) => (
            <div key={step.number} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: "1.1rem",
                    left: "3.5rem",
                    right: "-2rem",
                    height: "1px",
                    backgroundColor: "#333",
                  }}
                  className="process-line"
                />
              )}
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  color: "#8B7355",
                  marginBottom: "1.25rem",
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.15)",
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  marginBottom: "0.75rem",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#7A7A7A",
                  lineHeight: 1.8,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .process-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .process-line { display: none; }
        }
        @media (max-width: 600px) {
          .process-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
