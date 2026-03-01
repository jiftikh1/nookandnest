const features = [
  "Bespoke Design Solutions",
  "Sustainable Materials",
  "3D Visualization",
  "Project Management",
];

export default function About() {
  return (
    <section
      id="about"
      style={{
        backgroundColor: "#FFFFFF",
        padding: "6rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "center",
        }}
        className="about-grid"
      >
        {/* Image placeholder */}
        <div
          style={{
            height: "520px",
            background: "linear-gradient(160deg, #D4C5B0 0%, #8B7355 100%)",
            borderRadius: "2px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "1.5rem",
              left: "1.5rem",
              backgroundColor: "#FAF8F5",
              padding: "1rem 1.5rem",
            }}
          >
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355" }}>
              Design Studio
            </p>
          </div>
        </div>

        {/* Text */}
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8B7355",
              marginBottom: "1rem",
            }}
          >
            About Us
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 300,
              color: "#1A1A1A",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
            }}
          >
            Where vision meets artistry
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#7A7A7A",
              lineHeight: 1.85,
              marginBottom: "1.25rem",
            }}
          >
            Nooks & Nest was founded with a singular purpose: to create environments that elevate
            everyday living. Our team of experienced designers blends contemporary aesthetics with
            timeless principles to deliver spaces that are uniquely yours.
          </p>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#7A7A7A",
              lineHeight: 1.85,
              marginBottom: "2.5rem",
            }}
          >
            We believe that great design is about more than appearance. It&apos;s about how a space
            makes you feel, how it supports your daily life, and how it reflects your personality.
            Every project begins with listening.
          </p>

          {/* Features */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {features.map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ color: "#C4A882", fontSize: "0.6rem" }}>◆</span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.03em",
                    color: "#4A4A4A",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
