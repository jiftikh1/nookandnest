"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function ClientNav() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "#FAF8F5",
        borderBottom: "1px solid #E0DCD6",
        height: "64px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/client/dashboard"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.2rem",
            fontWeight: 400,
            color: "#1A1A1A",
            textDecoration: "none",
          }}
        >
          Nook <span style={{ color: "#8B7355" }}>&amp; Nest</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link
            href="/client/dashboard"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A7A7A",
              textDecoration: "none",
            }}
          >
            My Projects
          </Link>
          <button
            onClick={handleLogout}
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A7A7A",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
