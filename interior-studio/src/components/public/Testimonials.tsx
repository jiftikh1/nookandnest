const testimonials = [
  {
    initials: "JR",
    name: "James & Rachel",
    role: "Homeowners, Park Avenue",
    quote:
      "Nooks & Nest transformed our dated apartment into a space that feels both luxurious and completely natural. They listened to every detail and delivered beyond what we imagined.",
  },
  {
    initials: "ML",
    name: "Marco Lombardi",
    role: "Owner, Terra Restaurant",
    quote:
      "Working with the Nooks & Nest team on our restaurant was seamless. They understood the brand we were building and created an atmosphere that our guests constantly compliment.",
  },
  {
    initials: "SK",
    name: "Sarah Kim",
    role: "Homeowner, Brooklyn Heights",
    quote:
      "Professional, creative, and incredibly organized. Nooks & Nest managed our full home renovation on time and on budget. Our home finally feels like us.",
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
            gridTemplateColumns: "repeat(3, 1fr)",
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
