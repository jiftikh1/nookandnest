"use client";

export default function CTA() {
  return (
    <section
      style={{
        backgroundColor: "#F0EDE8",
        padding: "6rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#8B7355",
            marginBottom: "1.25rem",
          }}
        >
          Ready to Begin?
        </p>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 300,
            color: "#1A1A1A",
            lineHeight: 1.2,
            marginBottom: "1.25rem",
          }}
        >
          A quiet nook to retreat to. A nest that finally feels like yours.
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#7A7A7A",
            lineHeight: 1.8,
            marginBottom: "2.5rem",
          }}
        >
          This is yours. Let&apos;s make it feel like it. Schedule a complimentary consultation
          and let&apos;s talk about how your space could be transformed.
        </p>
        <a
          href="#contact"
          style={{
            display: "inline-block",
            padding: "1rem 2.5rem",
            backgroundColor: "#5C7A4E",
            color: "#FFFFFF",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "background 0.3s",
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#4A6840")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#5C7A4E")}
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
}
