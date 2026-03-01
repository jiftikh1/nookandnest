"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000,
        backgroundColor: "#1A1A1A", borderBottom: "1px solid rgba(255,255,255,0.08)",
        height: "64px", display: "flex", alignItems: "center",
      }}
    >
      <div style={{
        maxWidth: "1280px", margin: "0 auto", padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <Link href="/admin/dashboard" style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "#FAF8F5", fontWeight: 600, textDecoration: "none" }}>
            Nook <span style={{ color: "#C4A882" }}>&amp;</span> Nest
            <span style={{ fontSize: "0.6rem", color: "#7A7A7A", letterSpacing: "0.15em", textTransform: "uppercase", marginLeft: "0.6rem", fontFamily: "var(--font-sans)" }}>Admin</span>
          </Link>

          <div style={{ display: "flex", gap: "0.25rem" }}>
            {[
              { href: "/admin/dashboard", label: "Dashboard" },
              { href: "/admin/projects", label: "Projects" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.04em",
                  padding: "0.45rem 0.9rem", borderRadius: "4px",
                  color: isActive(href) ? "#FAF8F5" : "#7A7A7A",
                  backgroundColor: isActive(href) ? "rgba(255,255,255,0.08)" : "transparent",
                  textDecoration: "none", transition: "all 0.2s",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.45rem 1.2rem", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "3px", background: "transparent", color: "#7A7A7A",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
