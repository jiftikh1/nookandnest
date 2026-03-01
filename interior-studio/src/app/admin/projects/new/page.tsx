"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", clientName: "", clientEmail: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }
      const project = await res.json();
      router.push(`/admin/projects/${project.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem",
    border: "1px solid #E0DCD6", borderRadius: "3px",
    backgroundColor: "#FFFFFF", fontSize: "0.9rem", color: "#1A1A1A",
    outline: "none", fontFamily: "var(--font-sans)",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#4A4A4A", marginBottom: "0.5rem",
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "3rem 2rem" }}>
      <Link href="/admin/dashboard" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355", textDecoration: "none" }}>
        ← Dashboard
      </Link>

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 400, color: "#1A1A1A", margin: "1.5rem 0 2.5rem" }}>
        New Project
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px", padding: "2rem" }}>
          <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B7355", marginBottom: "1.5rem" }}>Project Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Project Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. Riverside Apartment — Living Room" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Brief overview of the project scope..."
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6", borderRadius: "4px", padding: "2rem" }}>
          <h2 style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B7355", marginBottom: "1.5rem" }}>Client Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Client Name *</label>
              <input style={inputStyle} value={form.clientName} onChange={e => set("clientName", e.target.value)} required placeholder="Full name" />
            </div>
            <div>
              <label style={labelStyle}>Client Email *</label>
              <input style={inputStyle} type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} required placeholder="client@example.com" />
              <p style={{ fontSize: "0.78rem", color: "#7A7A7A", marginTop: "0.4rem" }}>
                They'll use this email to log in to their client portal.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: "0.85rem 1rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "3px", fontSize: "0.85rem", color: "#B85C5C" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.8rem 2rem", backgroundColor: "#1A1A1A", color: "#FAF8F5",
              border: "none", borderRadius: "3px", fontSize: "0.8rem",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creating…" : "Create Project"}
          </button>
          <Link
            href="/admin/dashboard"
            style={{ padding: "0.8rem 1.5rem", border: "1px solid #E0DCD6", borderRadius: "3px", fontSize: "0.8rem", color: "#4A4A4A", textDecoration: "none" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
