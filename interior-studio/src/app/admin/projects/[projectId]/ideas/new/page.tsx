"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Furniture", "Color Palette", "Lighting", "Materials", "Overall", "Layout", "Accessories"];

export default function NewIdeaPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [externalNotes, setExternalNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("bucket", "ideas");
        fd.append("folder", projectId);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        urls.push(data.url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description: description || null,
          category: category || null,
          imageUrls: images,
          externalNotes: externalNotes || null,
          internalNotes: internalNotes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save idea");
      router.push(`/admin/projects/${projectId}`);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem" }}>
      <Link
        href={`/admin/projects/${projectId}`}
        style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355", textDecoration: "none" }}
      >
        ← Back to Project
      </Link>

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 400, color: "#1A1A1A", margin: "1.5rem 0 2.5rem" }}>
        Upload Design Idea
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Warm neutral palette for living room"
            style={inputStyle}
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe this design idea..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Images */}
        <div>
          <label style={labelStyle}>Images</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: "1.5px dashed #E0DCD6",
              borderRadius: "4px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#FAFAFA",
              transition: "border-color 0.2s",
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "#7A7A7A" }}>
              {uploading ? "Uploading..." : "Click to upload images"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#B0B0B0", marginTop: "0.35rem" }}>JPG, PNG, WEBP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
          {images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginTop: "1rem" }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "4px", border: "1px solid #E0DCD6" }} />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    style={{
                      position: "absolute", top: "4px", right: "4px",
                      background: "rgba(0,0,0,0.55)", color: "#fff",
                      border: "none", borderRadius: "50%",
                      width: "20px", height: "20px", fontSize: "11px",
                      cursor: "pointer", lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* External Notes */}
        <div>
          <label style={labelStyle}>Notes for Client</label>
          <textarea
            value={externalNotes}
            onChange={(e) => setExternalNotes(e.target.value)}
            rows={3}
            placeholder="Notes visible to the client..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Internal Notes */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Internal Notes</label>
            <span style={{ fontSize: "0.65rem", backgroundColor: "#F0EDE8", color: "#8B7355", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>
              Admin only
            </span>
          </div>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes — not visible to client..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {error && <p style={{ fontSize: "0.85rem", color: "#B85C5C" }}>{error}</p>}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={saving || uploading || !title.trim()}
            style={{
              padding: "0.8rem 2rem",
              backgroundColor: saving ? "#9A9A9A" : "#1A1A1A",
              color: "#FAF8F5",
              border: "none",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Idea"}
          </button>
          <Link
            href={`/admin/projects/${projectId}`}
            style={{
              padding: "0.8rem 2rem",
              border: "1px solid #E0DCD6",
              backgroundColor: "transparent",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#7A7A7A",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
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
  borderRadius: "2px",
};
