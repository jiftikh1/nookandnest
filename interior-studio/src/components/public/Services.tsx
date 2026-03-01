"use client";

const services = [
  {
    title: "Residential Design",
    description:
      "Complete home transformations from single rooms to entire residences. We create cohesive, livable spaces that reflect your lifestyle and taste.",
  },
  {
    title: "Commercial Spaces",
    description:
      "Offices, restaurants, hotels, and retail environments designed to enhance brand identity and optimize the experience for both staff and visitors.",
  },
  {
    title: "Space Planning",
    description:
      "Strategic layout design that maximizes flow, functionality, and comfort. We analyze your space to find the perfect arrangement for your needs.",
  },
  {
    title: "Furniture Curation",
    description:
      "Handpicked furniture and decor selections sourced from trusted artisans and luxury brands around the world, curated to your unique aesthetic.",
  },
  {
    title: "Renovation Guidance",
    description:
      "End-to-end renovation support from concept through completion. We manage contractors, timelines, and budgets so you don't have to.",
  },
  {
    title: "Styling & Staging",
    description:
      "Expert styling for lived-in homes or staged spaces for sale. We arrange every detail to create maximum visual impact and emotional connection.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      style={{
        backgroundColor: "#F0EDE8",
        padding: "6rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8B7355",
              marginBottom: "1rem",
            }}
          >
            What We Do
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 300,
              color: "#1A1A1A",
            }}
          >
            Design services tailored to your needs
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5px",
            backgroundColor: "#E0DCD6",
          }}
          className="services-grid"
        >
          {services.map((service) => (
            <div
              key={service.title}
              style={{
                backgroundColor: "#FFFFFF",
                padding: "2.5rem",
                transition: "transform 0.3s, box-shadow 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "1px",
                  backgroundColor: "#C4A882",
                  marginBottom: "1.5rem",
                }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.3rem",
                  fontWeight: 400,
                  color: "#1A1A1A",
                  marginBottom: "0.75rem",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#7A7A7A",
                  lineHeight: 1.8,
                  marginBottom: "1.5rem",
                }}
              >
                {service.description}
              </p>
              <a
                href="#contact"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#8B7355",
                  textDecoration: "none",
                  borderBottom: "1px solid #C4A882",
                  paddingBottom: "2px",
                }}
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
