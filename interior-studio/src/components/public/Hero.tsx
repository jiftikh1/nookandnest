"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        position: "relative",
        paddingTop: "7rem",
        paddingBottom: "5rem",
        overflow: "hidden",
      }}
    >

      {/* Vertical edge label */}
      <div
        className="edge-label"
        style={{
          position: "absolute",
          left: "1.25rem",
          top: "50%",
          transform: "rotate(-90deg)",
          transformOrigin: "left center",
          fontSize: "0.62rem",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "#5C7A4E",
          whiteSpace: "nowrap",
        }}
      >
        sanctuary — by design
      </div>

      <div
        className="hero-grid"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 3.5rem",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: "5rem",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Left: editorial text */}
        <div style={{ position: "relative" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#9E7D5A",
              marginBottom: "2.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.9rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "36px",
                height: "1px",
                backgroundColor: "#9E7D5A",
              }}
            />
            Est. quietly · Bay Area
          </p>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 6.8vw, 6rem)",
              fontWeight: 300,
              color: "#1A1A1A",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              marginBottom: "2.75rem",
            }}
          >
            You bring the space.
            <br />
            We&apos;ll set the{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "#3A2E24",
              }}
            >
              mood
            </em>
            .
          </h1>

          {/* Verse-like manifesto */}
          <div
            style={{
              borderLeft: "1px solid #9E7D5A",
              paddingLeft: "1.75rem",
              marginBottom: "3rem",
              maxWidth: "460px",
            }}
          >
            <p
              style={{
                fontSize: "0.92rem",
                color: "#7A6A58",
                lineHeight: 1.85,
                marginBottom: "1.1rem",
              }}
            >
              Most spaces look fine. An amazing space <em>hits</em> you — you feel it before you can explain it. That feeling isn&apos;t accidental. It&apos;s intentional. It&apos;s designed.
            </p>
            <p
              style={{
                fontSize: "0.92rem",
                color: "#7A6A58",
                lineHeight: 1.85,
                marginBottom: "1.1rem",
              }}
            >
              Nook &amp; Nest Interiors is a San Francisco / Bay Area studio designing spaces that evoke a feeling — calm, nostalgic, lively — that wraps around you before you&apos;ve set your bag down. Home or commercial, we create spaces that make people stop and say <em>this feels just right</em>.
            </p>
            <p
              style={{
                fontSize: "0.92rem",
                color: "#7A6A58",
                lineHeight: 1.85,
              }}
            >
              A quiet nook to retreat to. A nest that finally feels like yours. Let&apos;s build it together.
            </p>
          </div>

          <a
            href="#contact"
            className="hero-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.85rem",
              fontSize: "0.72rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#3A2E24",
              textDecoration: "none",
              borderBottom: "1px solid #3A2E24",
              paddingBottom: "0.45rem",
              transition: "color 900ms ease, gap 900ms ease, border-color 900ms ease",
            }}
          >
            Begin a conversation
            <span style={{ fontSize: "1rem" }}>→</span>
          </a>
        </div>

        {/* Right: asymmetric image composition */}
        <div
          className="hero-visual"
          style={{
            position: "relative",
            height: "640px",
          }}
        >
          {/* Primary tall image, offset right */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100%",
              aspectRatio: "4080 / 3072",
              border: "4px solid #3A2E24",
              overflow: "hidden",
              backgroundColor: "#3A2E24",
            }}
          >
            <Image
              src="/hero-main.jpg"
              alt="Designed interior"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 900px) 100vw, 700px"
              priority
            />
          </div>

          {/* Secondary inset image, bottom-left overlap */}
          <div
            style={{
              position: "absolute",
              bottom: "-8%",
              left: "-12%",
              width: "46%",
              height: "44%",
              border: "4px solid #3A2E24",
              overflow: "hidden",
              backgroundColor: "#3A2E24",
              zIndex: 2,
            }}
          >
            <Image
              src="/hero-faucet.jpg"
              alt="Interior detail"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 50vw, 320px"
              priority
            />
          </div>

          {/* Catalog-style caption */}
          <div
            style={{
              position: "absolute",
              bottom: "-2.25rem",
              right: 0,
              textAlign: "right",
            }}
          >
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#9E7D5A",
                marginBottom: "0.3rem",
              }}
            >
              No. 01
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "#3A2E24",
              }}
            >
              The slow kitchen
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-cta:hover {
          color: #9E7D5A;
          gap: 1.2rem;
          border-color: #9E7D5A;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3.5rem !important;
            padding: 0 1.5rem !important;
          }
          .hero-visual { height: 500px !important; }
          .edge-label { display: none !important; }
        }
      `}</style>
    </section>
  );
}
