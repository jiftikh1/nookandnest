"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#process", label: "Process" },
    { href: "#testimonials", label: "Reviews" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        backgroundColor: scrolled ? "rgba(250,248,245,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid #E0DCD6" : "1px solid transparent",
        padding: scrolled ? "0.75rem 0" : "1.5rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#1A1A1A",
            letterSpacing: "0.02em",
            textDecoration: "none",
          }}
        >
          Nooks<span style={{ color: "#8B7355" }}>&</span>Nest
        </a>

        {/* Desktop Nav */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="hidden md:flex"
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A4A4A",
                  textDecoration: "none",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#8B7355")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#4A4A4A")}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                backgroundColor: "#8B7355",
                padding: "0.6rem 1.4rem",
                textDecoration: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#7A6345")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#8B7355")}
            >
              Get in Touch
            </a>
          </li>
          <li>
            <Link
              href="/login"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7A7A7A",
                textDecoration: "none",
                borderBottom: "1px solid #E0DCD6",
                paddingBottom: "2px",
              }}
            >
              Client Login
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1.5px",
              backgroundColor: "#1A1A1A",
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1.5px",
              backgroundColor: "#1A1A1A",
              transition: "all 0.3s",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: "22px",
              height: "1.5px",
              backgroundColor: "#1A1A1A",
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "#FAF8F5",
            borderTop: "1px solid #E0DCD6",
            padding: "1.5rem 2rem",
          }}
        >
          {[...links, { href: "#contact", label: "Get in Touch" }].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 0",
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4A4A4A",
                textDecoration: "none",
                borderBottom: "1px solid #E0DCD6",
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              padding: "0.75rem 0",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7A7A7A",
              textDecoration: "none",
            }}
          >
            Client Login
          </Link>
        </div>
      )}
    </nav>
  );
}
