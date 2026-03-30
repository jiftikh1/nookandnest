"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
  { label: "Kitchen Detail", src: "/hero-faucet.jpg" },
  { label: "Dining Room", src: "/hero-dining.jpg" },
  { label: "Kitchen", src: "/hero-main.jpg" },
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
            Crafting spaces that tell{" "}
            <em style={{ fontStyle: "italic", color: "#8B7355" }}>your story</em>
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
            We create thoughtfully designed interiors that balance beauty with function,
            transforming your vision into spaces you&apos;ll love living in.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <a
              href="#contact"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                backgroundColor: "#8B7355",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#7A6345")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#8B7355")}
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
            gap: "0",
          }}
        >
          {/* Top two portrait images side by side — locked to faucet's aspect ratio */}
          {heroImages.slice(0, 2).map((img, i) => (
            <div
              key={img.label}
              style={{
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "2728 / 3410",
                border: "12px solid #1A4A35",
              }}
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                style={{ objectFit: "cover", objectPosition: i === 1 ? "center 55%" : "center" }}
                priority
              />
            </div>
          ))}
          {/* Bottom full-width landscape image */}
          <div style={{ gridColumn: "1 / -1", borderRadius: "2px", overflow: "hidden", border: "12px solid #1A4A35" }}>
            <Image
              src={heroImages[2].src}
              alt={heroImages[2].label}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
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
