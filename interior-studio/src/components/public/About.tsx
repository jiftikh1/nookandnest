import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      style={{
        padding: "6rem 0",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

        {/* ── Design Philosophy ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
            marginBottom: "6rem",
          }}
          className="about-grid"
        >
          {/* Image placeholder */}
          <div
            style={{
              height: "520px",
              borderRadius: "2px",
              position: "relative",
              overflow: "hidden",
              border: "4px solid #3A2E24",
            }}
          >
            <Image
              src="/images/controlled-chaos.jpg"
              alt="Interior Design Studio"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 560px"
              quality={90}
            />
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1.5rem",
                backgroundColor: "#FAF8F5",
                padding: "1rem 1.5rem",
                borderLeft: "3px solid #5C7A4E",
              }}
            >
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5C7A4E" }}>
                Design Studio
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8B7355",
                marginBottom: "1rem",
              }}
            >
              About Us
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 300,
                color: "#1A1A1A",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              Design Philosophy
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
                marginBottom: "1.25rem",
              }}
            >
              We believe every person deserves a home they genuinely want to come back to. A space
              that wraps around you at the end of a long day and reminds you why you built this life
              in the first place. That&apos;s why we design environments that are clutter-free and
              thoughtfully organized — because the state of your space has a direct effect on the
              state of your mind.
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
                marginBottom: "1.25rem",
              }}
            >
              For businesses, that something is your people and your purpose. When a workspace is
              intentional and well designed, your team thinks more clearly, collaborates more freely,
              and shows up with more energy. A well designed commercial space doesn&apos;t just
              reflect your brand — it amplifies it.
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
              }}
            >
              At Nook &amp; Nest, we design for both. Because whether it&apos;s a home or a
              business, the best spaces always make you feel like you belong there.
            </p>
          </div>
        </div>

        {/* ── Meet the Founders ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
          className="about-grid"
        >
          {/* Text */}
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#8B7355",
                marginBottom: "1rem",
              }}
            >
              The People Behind the Work
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 300,
                color: "#1A1A1A",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              Meet the Founders
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
                marginBottom: "1.25rem",
              }}
            >
              Every great design begins with a story. Ours began at home. Nook &amp; Nest Interiors
              was born from two deeply personal projects — Nada was navigating her own home
              renovation, and Maryam was curating her daughter&apos;s nursery. What started as
              separate journeys led to one shared realization: they weren&apos;t just designing
              spaces. They were changing how it felt to live in them.
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
                marginBottom: "1.25rem",
              }}
            >
              Maryam and Nada believe a well designed space is never just about aesthetics — it is
              about the feeling you carry when you are in it. The calm that greets you at the door.
              The quiet sense that everything is exactly where it should be.
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#7A7A7A",
                lineHeight: 1.85,
                fontStyle: "italic",
                fontFamily: "var(--font-serif)",
              }}
            >
              They take the time to understand not just your taste, but your life — because the best
              spaces are always personal. Every corner. Every shelf. Every nook.
            </p>
          </div>

          {/* Image placeholder */}
          <div
            style={{
              height: "520px",
              borderRadius: "2px",
              position: "relative",
              overflow: "hidden",
              border: "4px solid #3A2E24",
            }}
          >
            <Image
              src="/images/bedroom-mirror.jpg"
              alt="Maryam and Nada"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 560px"
              quality={90}
            />
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "1.5rem",
                backgroundColor: "#FAF8F5",
                padding: "1rem 1.5rem",
                borderRight: "3px solid #8B7355",
              }}
            >
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8B7355" }}>
                Maryam &amp; Nada
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
