"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  roundId: string;
  revisionsUsed: number;
  revisionsAllowed: number;
}

export default function RoundResponse({ roundId, revisionsUsed, revisionsAllowed }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"APPROVED" | "CHANGES_REQUESTED" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextRevision = revisionsUsed + 1;
  const isExtra = nextRevision > revisionsAllowed;
  const extraNumber = nextRevision - revisionsAllowed;

  async function submit() {
    if (!mode) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/rounds/${roundId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: mode, feedback }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError((await res.json()).error || "Something went wrong");
      setLoading(false);
    }
  }

  function cancel() {
    setMode(null);
    setFeedback("");
    setError(null);
  }

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setMode("APPROVED")}
          className="text-xs tracking-widest uppercase px-6 py-2.5" style={{ backgroundColor: "#4A7B5B", color: "#FFFFFF" }}>
          Approve Design
        </button>
        <button onClick={() => setMode("CHANGES_REQUESTED")}
          className="text-xs tracking-widest uppercase px-6 py-2.5 border" style={{ borderColor: "#B85C5C", color: "#B85C5C" }}>
          Request Changes
        </button>
      </div>
    );
  }

  const requesting = mode === "CHANGES_REQUESTED";

  return (
    <div className="space-y-3">
      {requesting ? (
        <>
          <p className="text-sm" style={{ color: "#4A4A4A" }}>
            This will be revision {nextRevision} of {revisionsAllowed} included in your agreement.
          </p>
          {isExtra && (
            <div className="p-3 border-l-2 text-sm" style={{ borderColor: "#B8860B", backgroundColor: "#FFF8E7", color: "#4A4A4A" }}>
              You&apos;ve used all {revisionsAllowed} included revision{revisionsAllowed !== 1 ? "s" : ""} for this space.
              This would be additional revision #{extraNumber} and may be billed separately.
            </div>
          )}
        </>
      ) : (
        <p className="text-sm" style={{ color: "#4A4A4A" }}>
          Approving signs off this space as complete. Add an optional note for your designer.
        </p>
      )}

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        placeholder={requesting ? "What would you like changed?" : "Optional note..."}
        className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-y"
        style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
      />

      {error && <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={submit}
          disabled={loading || (requesting && !feedback.trim())}
          className="text-xs tracking-widest uppercase px-6 py-2.5 transition-opacity"
          style={{
            backgroundColor: requesting ? "#B85C5C" : "#4A7B5B",
            color: "#FFFFFF",
            opacity: loading || (requesting && !feedback.trim()) ? 0.5 : 1,
          }}
        >
          {loading ? "Saving..." : requesting ? (isExtra ? "Request Extra Revision" : "Send Change Request") : "Confirm Approval"}
        </button>
        <button onClick={cancel} disabled={loading}
          className="text-xs tracking-widest uppercase px-6 py-2.5 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
