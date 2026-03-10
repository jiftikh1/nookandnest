"use client";

import { useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF8F5",
        display: "flex",
        alignItems: "center",
        paddingTop: "5rem",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          width: "100%",
        }}
        className="hero-grid"
      >
        {/* Content */}
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8B7355",
              marginBottom: "1.5rem",
            }}
          >
            Interior Design Studio
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 300,
              color: "#1A1A1A",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            You bring the space.{" "}
            <em style={{ fontStyle: "italic", color: "#8B7355" }}>We&apos;ll set the mood.</em>
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#7A7A7A",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
              maxWidth: "480px",
            }}
          >
            Most spaces look fine. An amazing space hits you the moment you walk in — and you
            can&apos;t quite explain why. That feeling isn&apos;t accidental. It&apos;s intentional.
            It&apos;s designed. Welcome to Nook &amp; Nest Interiors, a San Francisco Bay Area
            studio creating spaces that go beyond beautiful.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="#contact"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                backgroundColor: "#5C7A4E",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#4A6840")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#5C7A4E")}
            >
              Start Your Project
            </a>
            <a
              href="#portfolio"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                backgroundColor: "transparent",
                color: "#1A1A1A",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "1px solid #E0DCD6",
                transition: "border-color 0.3s",
              }}
            >
              View Our Work →
            </a>
          </div>
        </div>

        {/* Hero Visual */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: "1rem",
          }}
        >
          {/* Main large image */}
          <div
            style={{
              gridColumn: "1 / -1",
              height: "280px",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
              border: "2px solid #5C7A4E",
            }}
          >
            <Image
              src="/images/zahra-bedroom.png"
              alt="Zahra's Bedroom"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 600px"
              quality={90}
              priority
            />
            <span style={{
              position: "absolute", bottom: "1rem", left: "1.25rem", zIndex: 1,
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.35)",
              padding: "0.25rem 0.6rem",
            }}>
              Bedroom
            </span>
          </div>

          {/* Dining */}
          <div
            style={{
              height: "160px",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
              border: "2px solid #8B7355",
            }}
          >
            <Image
              src="/images/dining-room.jpg"
              alt="Dining Room"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 50vw, 290px"
              quality={90}
            />
            <span style={{
              position: "absolute", bottom: "0.75rem", left: "1rem", zIndex: 1,
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.35)",
              padding: "0.25rem 0.6rem",
            }}>
              Dining
            </span>
          </div>

          {/* Bedroom */}
          <div
            style={{
              height: "160px",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
              border: "2px solid #5C7A4E",
            }}
          >
            <Image
              src="/images/bedroom-chair.jpg"
              alt="Bedroom"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 50vw, 290px"
              quality={90}
            />
            <span style={{
              position: "absolute", bottom: "0.75rem", left: "1rem", zIndex: 1,
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.35)",
              padding: "0.25rem 0.6rem",
            }}>
              Bedroom
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
