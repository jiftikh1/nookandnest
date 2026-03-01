"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DesignIdea } from "@prisma/client";

interface Props {
  idea: DesignIdea;
  projectId: string;
  STATUS_LABELS: Record<string, string>;
  STATUS_COLORS: Record<string, { bg: string; text: string }>;
}

export default function IdeaCard({ idea, projectId, STATUS_LABELS, STATUS_COLORS }: Props) {
  const router = useRouter();
  const [pushing, setPushing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  async function togglePush() {
    setPushing(true);
    await fetch(`/api/ideas/${idea.id}/push`, { method: "POST" });
    router.refresh();
    setPushing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${idea.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
    router.refresh();
  }

  const colors = STATUS_COLORS[idea.clientStatus] || STATUS_COLORS.PENDING;
  const hasImages = idea.imageUrls.length > 0;

  return (
    <div style={{
      backgroundColor: "#FFFFFF", border: "1px solid #E0DCD6",
      borderRadius: "4px", overflow: "hidden",
      opacity: deleting ? 0.5 : 1, transition: "opacity 0.2s",
    }}>
      {/* Image area */}
      <div style={{ position: "relative", aspectRatio: "4/3", backgroundColor: "#F0EDE8", overflow: "hidden" }}>
        {hasImages ? (
          <>
            <img
              src={idea.imageUrls[imgIndex]}
              alt={idea.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {idea.imageUrls.length > 1 && (
              <div style={{ position: "absolute", bottom: "0.75rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.35rem" }}>
                {idea.imageUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    style={{
                      width: i === imgIndex ? "20px" : "6px", height: "6px",
                      borderRadius: "3px", border: "none", cursor: "pointer",
                      backgroundColor: i === imgIndex ? "#FAF8F5" : "rgba(255,255,255,0.5)",
                      transition: "all 0.2s", padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#C4A882", fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
            No images
          </div>
        )}

        {/* Category badge */}
        {idea.category && (
          <div style={{
            position: "absolute", top: "0.75rem", left: "0.75rem",
            padding: "0.2rem 0.6rem", backgroundColor: "rgba(26,26,26,0.75)",
            borderRadius: "2px", fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#FAF8F5",
          }}>
            {idea.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#1A1A1A", fontWeight: 400 }}>{idea.title}</h3>
          {idea.isPushed && (
            <span style={{
              flexShrink: 0, fontSize: "0.6rem", padding: "0.2rem 0.55rem",
              borderRadius: "2px", backgroundColor: colors.bg, color: colors.text,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {STATUS_LABELS[idea.clientStatus]}
            </span>
          )}
        </div>

        {idea.description && (
          <p style={{ fontSize: "0.82rem", color: "#4A4A4A", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            {idea.description}
          </p>
        )}

        {/* External notes preview */}
        {idea.externalNotes && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#F0EDE8", borderRadius: "3px", marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355", marginBottom: "0.2rem" }}>Client Note</p>
            <p style={{ fontSize: "0.8rem", color: "#4A4A4A", lineHeight: 1.5 }}>{idea.externalNotes}</p>
          </div>
        )}

        {/* Internal notes — admin only */}
        {idea.internalNotes && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#FFFBF0", border: "1px dashed #E0DCD6", borderRadius: "3px", marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8860B", marginBottom: "0.2rem" }}>Internal Note</p>
            <p style={{ fontSize: "0.8rem", color: "#4A4A4A", lineHeight: 1.5 }}>{idea.internalNotes}</p>
          </div>
        )}

        {/* Client feedback */}
        {idea.isPushed && idea.clientNote && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#F8FAF8", border: "1px solid #E0DCD6", borderRadius: "3px", marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A7B5B", marginBottom: "0.2rem" }}>Client Feedback</p>
            <p style={{ fontSize: "0.8rem", color: "#4A4A4A", fontStyle: "italic", lineHeight: 1.5 }}>"{idea.clientNote}"</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <button
            onClick={togglePush}
            disabled={pushing}
            style={{
              flex: 1, padding: "0.55rem 0.75rem",
              backgroundColor: idea.isPushed ? "#F0EDE8" : "#1A1A1A",
              color: idea.isPushed ? "#8B7355" : "#FAF8F5",
              border: idea.isPushed ? "1px solid #E0DCD6" : "1px solid #1A1A1A",
              borderRadius: "3px", fontSize: "0.7rem", letterSpacing: "0.08em",
              textTransform: "uppercase", cursor: "pointer", opacity: pushing ? 0.6 : 1,
            }}
          >
            {pushing ? "…" : idea.isPushed ? "← Unpush" : "Push to Client →"}
          </button>
          <Link
            href={`/admin/projects/${projectId}/ideas/${idea.id}/edit`}
            style={{
              padding: "0.55rem 0.75rem", border: "1px solid #E0DCD6",
              borderRadius: "3px", fontSize: "0.7rem", color: "#4A4A4A",
              textDecoration: "none", letterSpacing: "0.06em",
            }}
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "0.55rem 0.6rem", border: "1px solid #FECACA",
              borderRadius: "3px", fontSize: "0.7rem", color: "#B85C5C",
              background: "none", cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
