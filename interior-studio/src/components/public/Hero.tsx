"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { target: 250, label: "Projects Completed" },
  { target: 15, label: "Years Experience" },
  { target: 30, label: "Design Awards" },
];

function useCounter(target: number, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [target, started]);
  return count;
}

function StatCounter({ target, label }: { target: number; label: string }) {
  const count = useCounter(target, true);
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "2.5rem",
          fontWeight: 300,
          color: "#1A1A1A",
          lineHeight: 1,
        }}
      >
        {count}+
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7A7A7A",
          marginTop: "0.4rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

const heroImages = [
  { label: "Living Room", bg: "linear-gradient(160deg, #C4B5A0, #8B7355)" },
  { label: "Kitchen", bg: "linear-gradient(160deg, #B8A990, #7A6545)" },
  { label: "Bedroom", bg: "linear-gradient(160deg, #D4C5B0, #9A8A70)" },
];

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
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
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

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid #E0DCD6",
            }}
          >
            {stats.map((s) => (
              <StatCounter key={s.label} target={s.target} label={s.label} />
            ))}
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
            <img
              src="https://picsum.photos/seed/livingroom/800/560"
              alt="Living Room"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <span style={{
              position: "absolute", bottom: "1rem", left: "1.25rem",
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.35)",
              padding: "0.25rem 0.6rem",
            }}>
              Living Room
            </span>
          </div>

          {/* Kitchen */}
          <div
            style={{
              height: "160px",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
              border: "2px solid #8B7355",
            }}
          >
            <img
              src="https://picsum.photos/seed/kitchen1/400/320"
              alt="Kitchen"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <span style={{
              position: "absolute", bottom: "0.75rem", left: "1rem",
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(0,0,0,0.35)",
              padding: "0.25rem 0.6rem",
            }}>
              Kitchen
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
            <img
              src="https://picsum.photos/seed/bedroom1/400/320"
              alt="Bedroom"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <span style={{
              position: "absolute", bottom: "0.75rem", left: "1rem",
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
