"use client";

const services = [
  {
    title: "Residential Design",
    description:
      "Your home is the one place that should feel entirely, unapologetically yours. We work with homeowners to create spaces that are beautiful, functional, and deeply personal — whether it's a single room refresh or a full home transformation. We design for the way you actually live: the morning routines, the quiet evenings, the gatherings.",
  },
  {
    title: "Commercial Spaces",
    description:
      "A well designed commercial space does more than look impressive. It shapes how your team feels coming to work, how your clients experience your brand, and how your business tells its story. From offices and restaurants to retail and hospitality environments, we design with both function and feeling in mind.",
  },
  {
    title: "Space Planning",
    description:
      "Before we talk about finishes, furniture, or color palettes, we talk about how you use your space. We look at how rooms flow, where light falls, how traffic moves, and what each area needs to deliver. Getting this right means the rest of the design has a strong foundation — and you end up with a space that feels as good as it looks.",
  },
  {
    title: "Furniture Curation",
    description:
      "We provide a fully curated product list — every furniture piece, fabric, finish, and accessory selected specifically for your space. Think of it as a personalized shopping guide built around your home, your taste, and your budget. All you have to do is say yes.",
  },
  {
    title: "Renovation Guidance",
    description:
      "Renovations are exciting in theory and overwhelming in practice. We offer renovation guidance on both an hourly and fixed rate basis — stepping in as your dedicated point of contact to plan, coordinate, and manage the moving parts. We work directly with contractors and give you clear updates that fit around your schedule.",
  },
  {
    title: "Styling & Staging",
    description:
      "Maybe your home just needs a refresh. Maybe something is off and you can't quite put your finger on it. Our styling and staging service covers everything from seasonal updates and colour consultations to furniture suggestions and room styling. It's design support on your terms — flexible, approachable, and tailored to wherever you are in the process.",
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
              marginBottom: "1.25rem",
            }}
          >
            Design services tailored to how you want to live, work, and feel
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
            Great design doesn&apos;t happen by accident. It happens through listening,
            intentionality, and a deep understanding of the people a space is built for. Every
            project starts with the same question: <em>How should this space make you feel?</em>
          </p>
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
          {services.map((service, i) => {
            const isGreen = i % 2 === 0;
            const accent = isGreen ? "#5C7A4E" : "#8B7355";
            const accentLight = isGreen ? "#7A9B6B" : "#C4A882";
            return (
              <div
                key={service.title}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "2.5rem",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "default",
                  borderTop: `3px solid ${accent}`,
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
                    height: "2px",
                    backgroundColor: accent,
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
                    color: accent,
                    textDecoration: "none",
                    borderBottom: `1px solid ${accentLight}`,
                    paddingBottom: "2px",
                  }}
                >
                  Learn More
                </a>
              </div>
            );
          })}
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
