"use client";

import { useState } from "react";

const projects = [
  {
    title: "Modern Loft Residence",
    category: "residential",
    description:
      "A minimalist loft conversion featuring open-plan living, natural materials, and custom built-in storage throughout.",
    bg: "linear-gradient(160deg, #B8A990, #7A6545)",
  },
  {
    title: "Aura Co-working Space",
    category: "commercial",
    description:
      "A collaborative workspace designed for creativity, with flexible zones, biophilic elements, and acoustic considerations.",
    bg: "linear-gradient(160deg, #A89580, #6B5B45)",
  },
  {
    title: "Serene Boutique Hotel",
    category: "hospitality",
    description:
      "A 24-room boutique hotel blending local heritage with contemporary luxury. Each room tells a unique story.",
    bg: "linear-gradient(160deg, #C4B5A0, #8B7355)",
  },
  {
    title: "Coastal Family Home",
    category: "residential",
    description:
      "A beachfront family home with warm textures, ocean-inspired palettes, and seamless indoor-outdoor living spaces.",
    bg: "linear-gradient(160deg, #D4C5B0, #9A8A70)",
  },
  {
    title: "Terra Restaurant",
    category: "commercial",
    description:
      "An intimate dining space with earthy tones, dramatic lighting, and custom furniture that sets the mood for fine dining.",
    bg: "linear-gradient(160deg, #8B7355, #5A4530)",
  },
  {
    title: "Spa & Wellness Center",
    category: "hospitality",
    description:
      "A tranquil retreat space using natural stone, warm lighting, and flowing water features to create a restorative atmosphere.",
    bg: "linear-gradient(160deg, #C4A882, #8B7355)",
  },
];

const filters = ["all", "residential", "commercial", "hospitality"];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightbox, setLightbox] = useState<(typeof projects)[0] | null>(null);

  const filtered = projects.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  return (
    <section id="portfolio" style={{ backgroundColor: "#FAF8F5", padding: "6rem 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8B7355",
                marginBottom: "0.75rem",
              }}
            >
              Our Work
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 300,
                color: "#1A1A1A",
              }}
            >
              Featured projects
            </h2>
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "capitalize",
                  border: "1px solid",
                  borderColor: activeFilter === f ? "#8B7355" : "#E0DCD6",
                  backgroundColor: activeFilter === f ? "#8B7355" : "transparent",
                  color: activeFilter === f ? "#FFFFFF" : "#7A7A7A",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
          className="portfolio-grid"
        >
          {filtered.map((project) => (
            <div
              key={project.title}
              onClick={() => setLightbox(project)}
              style={{
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: "2px",
              }}
            >
              <div
                style={{
                  height: "260px",
                  background: project.bg,
                  transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "1.25rem",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                }
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {project.category}
                </span>
              </div>
              <div style={{ padding: "1.25rem 0" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    color: "#1A1A1A",
                    marginBottom: "0.4rem",
                  }}
                >
                  {project.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#7A7A7A",
                    lineHeight: 1.7,
                  }}
                >
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "600px",
              width: "100%",
              backgroundColor: "#FAF8F5",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "300px", background: lightbox.bg }} />
            <div style={{ padding: "2rem" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#8B7355",
                  marginBottom: "0.5rem",
                }}
              >
                {lightbox.category}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  fontWeight: 300,
                  color: "#1A1A1A",
                  marginBottom: "1rem",
                }}
              >
                {lightbox.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#7A7A7A", lineHeight: 1.8 }}>
                {lightbox.description}
              </p>
              <button
                onClick={() => setLightbox(null)}
                style={{
                  marginTop: "1.5rem",
                  padding: "0.6rem 1.5rem",
                  backgroundColor: "transparent",
                  border: "1px solid #E0DCD6",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#4A4A4A",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .portfolio-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
