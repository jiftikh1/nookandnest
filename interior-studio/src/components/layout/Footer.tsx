"use client";

import Link from "next/link";

const footerLinks = {
  Services: ["Residential Design", "Commercial Spaces", "Space Planning", "Furniture Curation"],
  Company: ["About Us", "Portfolio", "Our Process", "Reviews"],
};

const connectLinks = [
  { label: "Contact Us", href: "#contact" },
  { label: "Instagram", href: "https://www.instagram.com/baynookandnest/" },
  { label: "Email", href: "mailto:baynookandnest@gmail.com" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF", padding: "4rem 0 2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <a
              href="#"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                fontWeight: 400,
                color: "#FFFFFF",
                textDecoration: "none",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              Nooks<span style={{ color: "#8B7355" }}>&</span>Nest
            </a>
            <p style={{ fontSize: "0.85rem", color: "#7A7A7A", lineHeight: 1.8, maxWidth: "260px" }}>
              Creating thoughtfully designed interiors that balance beauty with function in the San Francisco Bay Area.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#7A7A7A",
                  marginBottom: "1.25rem",
                }}
              >
                {title}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#C4A882")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column */}
          <div>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7A7A7A",
                marginBottom: "1.25rem",
              }}
            >
              Connect
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {connectLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#C4A882")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "#7A7A7A" }}>
            © 2026 Nooks & Nest. All rights reserved.
          </p>
          <Link
            href="/login"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
          >
            Client Portal →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
