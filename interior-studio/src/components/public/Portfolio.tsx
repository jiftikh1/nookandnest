"use client";

import { useState } from "react";
import Image from "next/image";

const projects = [
  {
    title: "Zahra's Bedroom",
    category: "residential",
    description:
      "A serene bedroom transformation featuring rattan accents, sage green curtains, and a perfectly curated ladder shelf that balances warmth with calm.",
    img: "/images/zahra-bedroom.png",
  },
  {
    title: "Ilham's Soho Glam Bedroom",
    category: "residential",
    description:
      "A soho glam bedroom with Italian marble-texture wallpaper, satin and velvet finishes, and a curated Instagram nook — designed for a modern creative.",
    img: "/images/concept-board-ilham.png",
  },
  {
    title: "The Organized Nook",
    category: "residential",
    description:
      "A compact study corner transformed into a beautifully organized workspace with a ladder shelf, curated accessories, and natural light.",
    img: "/images/controlled-chaos.jpg",
  },
  {
    title: "Rattan Retreat",
    category: "residential",
    description:
      "A bedroom sanctuary centered around a statement hanging rattan chair, soft neutrals, and layered textures for a cozy, resort-like feel.",
    img: "/images/bedroom-chair.jpg",
  },
  {
    title: "Dining Room Refresh",
    category: "commercial",
    description:
      "An airy dining space with mixed wooden chairs, a zinc-top table, and natural light — bringing warmth and a relaxed gathering atmosphere.",
    img: "/images/dining-room.jpg",
  },
  {
    title: "The Mirror & The Monstera",
    category: "residential",
    description:
      "A styled bedroom corner using a full-length arch mirror, a lush monstera plant, and a woven basket to create a bold yet organic vignette.",
    img: "/images/bedroom-mirror.jpg",
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
    <section id="portfolio" style={{ padding: "6rem 0" }}>
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
                  borderColor: activeFilter === f ? "#9E7D5A" : "#E0DCD6",
                  backgroundColor: activeFilter === f ? "#9E7D5A" : "transparent",
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
                  overflow: "hidden",
                  position: "relative",
                  border: "4px solid #3A2E24",
                }}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector("img") as HTMLElement;
                  if (img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector("img") as HTMLElement;
                  if (img) img.style.transform = "scale(1)";
                }}
              >
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px"
                  quality={85}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "1rem",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.9)",
                    backgroundColor: "rgba(0,0,0,0.35)",
                    padding: "0.2rem 0.5rem",
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
            <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
              <Image
                src={lightbox.img}
                alt={lightbox.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="600px"
                quality={90}
              />
            </div>
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
