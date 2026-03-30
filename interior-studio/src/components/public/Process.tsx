const steps = [
  {
    number: "01",
    title: "Discovery & Requirements Gathering",
    description:
      "Every successful project begins with understanding your unique needs, lifestyle, or business goals. During our initial consultation, we dive deep into your functional requirements and aesthetic aspirations — from storage solutions for a busy household to the specific flow of a commercial space.",
  },
  {
    number: "02",
    title: "Design Inspiration & Concept Creation",
    description:
      "Once we understand your vision, we translate it into a tangible design direction. We develop tailored mood boards that capture the desired mood, color palette, and textures for each space — with multiple options per space so you can choose the aesthetic that speaks to you.",
  },
  {
    number: "03",
    title: "Spatial Planning & 3D Renderings",
    description:
      "With the conceptual direction approved, we develop strategic spatial layouts to optimize flow, scale, and functionality. We then bring these layouts to life through detailed 3D renderings — giving you an immersive, highly accurate visualization of exactly what your new space will look like.",
  },
  {
    number: "04",
    title: "Collaborative Feedback & Design Iteration",
    description:
      "Your input is integral to our process. We present the proposed layouts and renderings and invite your honest feedback. We then iterate — tweaking and refining until the final rendering perfectly aligns with your expectations.",
  },
  {
    number: "05",
    title: "Sourcing & Procurement",
    description:
      "With the final design approved, we handle the meticulous process of sourcing the perfect materials, finishes, and furnishings. We curate high-quality items that fit the design narrative and budget, including dedicated store visits and vendor coordination.",
  },
  {
    number: "06",
    title: "Implementation & Final Styling",
    description:
      "In the final phase, we bring the 3D vision into reality. We oversee the placement of furnishings, the installation of decor, and the final styling touches that elevate the space — delivering a beautifully cohesive environment that is completely ready for you to enjoy or open for business.",
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
              marginBottom: "1.25rem",
            }}
          >
            Our design process
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#7A7A7A",
              lineHeight: 1.8,
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            At Nook &amp; Nest, we believe that exceptional design is the result
            of a seamless partnership with our clients. Our structured approach
            ensures that every detail is thoughtfully executed — whether we're
            designing a cozy family home or a dynamic commercial environment.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "3rem 2.5rem",
          }}
          className="process-grid"
        >
          {steps.map((step, i) => (
            <div key={step.number} style={{ borderLeft: `2px solid ${i % 2 === 0 ? "#5C7A4E" : "#8B7355"}`, paddingLeft: "1.25rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 300,
                  color: i % 2 === 0 ? "rgba(92,122,78,0.4)" : "rgba(255,255,255,0.12)",
                  marginBottom: "1.25rem",
                }}
              >
                {step.number}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  color: "#FFFFFF",
                  marginBottom: "0.75rem",
                  lineHeight: 1.4,
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
        }
        @media (max-width: 600px) {
          .process-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
