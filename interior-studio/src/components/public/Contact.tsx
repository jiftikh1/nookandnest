"use client";

import { useState } from "react";

const contactDetails = [
  { label: "Email", value: "baynookandnest@gmail.com", href: "mailto:baynookandnest@gmail.com" },
  { label: "Instagram", value: "@baynookandnest", href: "https://www.instagram.com/baynookandnest/" },
  { label: "Hours", value: "Mon — Fri: 9AM — 6PM\nSat: By Appointment" },
];

const services = [
  "Residential Design",
  "Commercial Spaces",
  "Space Planning",
  "Furniture Curation",
  "Renovation Guidance",
  "Styling & Staging",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      (e.target as HTMLFormElement).reset();
    }, 3000);
  }

  return (
    <section
      id="contact"
      style={{ backgroundColor: "#FAF8F5", padding: "6rem 0" }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
        }}
        className="contact-grid"
      >
        {/* Form */}
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
            Contact Us
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 3vw, 2.5rem)",
              fontWeight: 300,
              color: "#1A1A1A",
              marginBottom: "2.5rem",
            }}
          >
            Start your project
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" required placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input type="email" required placeholder="your@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" placeholder="+1 (555) 000-0000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Service Interested In</label>
              <select style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select a service...</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tell Us About Your Project</label>
              <textarea
                rows={5}
                placeholder="Describe your space, goals, and timeline..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "1rem",
                backgroundColor: submitted ? "#4a7c59" : "#8B7355",
                color: "#FFFFFF",
                border: "none",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
            >
              {submitted ? "Message Sent!" : "Send Message"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div style={{ paddingTop: "3.5rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 300,
              color: "#1A1A1A",
              marginBottom: "0.75rem",
            }}
          >
            Get in touch
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#7A7A7A", lineHeight: 1.8, marginBottom: "2.5rem" }}>
            We&apos;d love to hear about your project. Reach out and we&apos;ll get back to you within 24 hours.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {contactDetails.map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "1.5rem" }}>
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#C4A882",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#8B7355",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {item.label}
                  </p>
                  {"href" in item ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.875rem",
                        color: "#4A4A4A",
                        lineHeight: 1.7,
                        textDecoration: "none",
                        borderBottom: "1px solid #E0DCD6",
                      }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#4A4A4A",
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#4A4A4A",
  marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1px solid #E0DCD6",
  backgroundColor: "#FFFFFF",
  fontSize: "0.875rem",
  color: "#1A1A1A",
  outline: "none",
  fontFamily: "inherit",
};
