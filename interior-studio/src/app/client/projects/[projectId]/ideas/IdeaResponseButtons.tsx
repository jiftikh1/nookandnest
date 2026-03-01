"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IdeaResponseButtons({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [pendingStatus, setPendingStatus] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function respond(status: "APPROVED" | "REJECTED", clientNote?: string) {
    setLoading(status);
    try {
      await fetch(`/api/ideas/${ideaId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: clientNote || null }),
      });
      router.refresh();
    } finally {
      setLoading(null);
      setShowNote(false);
      setNote("");
      setPendingStatus(null);
    }
  }

  function handleClick(status: "APPROVED" | "REJECTED") {
    setPendingStatus(status);
    setShowNote(true);
  }

  if (showNote && pendingStatus) {
    return (
      <div style={{ marginTop: "1rem" }}>
        <p style={{ fontSize: "0.8rem", color: "#4A4A4A", marginBottom: "0.5rem" }}>
          Add an optional note (leave blank to skip):
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="e.g. Love the colour palette, but prefer linen over velvet..."
          style={{
            width: "100%",
            padding: "0.65rem 0.85rem",
            border: "1px solid #E0DCD6",
            fontSize: "0.85rem",
            color: "#1A1A1A",
            fontFamily: "inherit",
            resize: "vertical",
            marginBottom: "0.75rem",
          }}
        />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => respond(pendingStatus, note)}
            disabled={!!loading}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: pendingStatus === "APPROVED" ? "#4A7B5B" : "#B85C5C",
              color: "#FFFFFF",
              border: "none",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : pendingStatus === "APPROVED" ? "Confirm Approve" : "Confirm Decline"}
          </button>
          <button
            onClick={() => { setShowNote(false); setPendingStatus(null); setNote(""); }}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "transparent",
              border: "1px solid #E0DCD6",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A7A7A",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
      <button
        onClick={() => handleClick("APPROVED")}
        disabled={!!loading}
        style={{
          padding: "0.65rem 1.75rem",
          backgroundColor: "#4A7B5B",
          color: "#FFFFFF",
          border: "none",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Approve
      </button>
      <button
        onClick={() => handleClick("REJECTED")}
        disabled={!!loading}
        style={{
          padding: "0.65rem 1.75rem",
          backgroundColor: "transparent",
          color: "#B85C5C",
          border: "1px solid #B85C5C",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Decline
      </button>
    </div>
  );
}
