const testimonials = [
  {
    initials: "FG",
    name: "Farin Godil",
    role: "",
    quote:
      "Working with Nook and Nest was an absolute delight. Their design for my guest room far exceeded my expectations. I was most impressed by their attention to my budget; they sourced products that looked high-end but were very economical. The process was seamless, offering multiple layouts to help me visualize the space. I felt heard throughout and couldn't be happier. If you need a designer who genuinely cares, look no further!",
  },
  {
    initials: "IM",
    name: "Ilham Malick",
    role: "Home Owner, Eden Shores",
    quote:
      "I knew what I wanted but couldn't quite put it into words. Nook and Nest figured it out anyway. Their moodboards and renderings made everything click, and suddenly I could see exactly what my space was going to become. They got my style immediately and elevated it in ways I wouldn't have thought of myself. The whole experience felt collaborative, considerate, and genuinely exciting. I'm counting down the days to see it finished.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      style={{ backgroundColor: "#FFFFFF", padding: "6rem 0" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
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
            Client Reviews
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 300,
              color: "#1A1A1A",
            }}
          >
            What our clients say
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "2rem",
          }}
          className="testimonials-grid"
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                backgroundColor: "#FAF8F5",
                padding: "2.5rem",
                borderRadius: "2px",
                position: "relative",
              }}
            >
              {/* Stars */}
              <div style={{ color: "#C4A882", fontSize: "0.75rem", marginBottom: "1.5rem", letterSpacing: "0.2em" }}>
                ★★★★★
              </div>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#4A4A4A",
                  lineHeight: 1.85,
                  fontStyle: "italic",
                  marginBottom: "2rem",
                  fontFamily: "var(--font-serif)",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#E0DCD6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "#8B7355",
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1A1A1A" }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#7A7A7A", marginTop: "0.15rem" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .testimonials-grid { grid-template-columns: 1fr !important; max-width: 520px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
