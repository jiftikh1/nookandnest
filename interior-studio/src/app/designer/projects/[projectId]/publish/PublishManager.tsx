"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  currentStatus: string;
  clientMessage: string;
  canPublish: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", IN_REVIEW: "In Review", PUBLISHED: "Published", ARCHIVED: "Archived",
  ACTIVE: "Draft", COMPLETED: "Published",
};

export default function PublishManager({ projectId, currentStatus, clientMessage: initialMessage, canPublish }: Props) {
  const [message, setMessage] = useState(initialMessage);
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateProject(updates: Record<string, string>) {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setSaving(false);
    return data;
  }

  async function saveMessage() {
    await updateProject({ clientMessage: message });
  }

  async function publishProject() {
    await updateProject({ status: "PUBLISHED", clientMessage: message });
    setStatus("PUBLISHED");
    router.refresh();
  }

  async function changeStatus(newStatus: string) {
    await updateProject({ status: newStatus });
    setStatus(newStatus);
    router.refresh();
  }

  const isPublished = status === "PUBLISHED" || status === "COMPLETED";

  return (
    <div className="space-y-6">
      {/* Client message */}
      <div className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
        <label className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>
          Personal message to client (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Hi Sarah! I'm so excited to share this vision for your home..."
          rows={4}
          className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-none"
          style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveMessage}
            disabled={saving}
            className="text-xs tracking-widest uppercase px-4 py-2 border"
            style={{ borderColor: "#8B7355", color: "#8B7355" }}
          >
            {saving ? "Saving..." : "Save Message"}
          </button>
        </div>
      </div>

      {/* Current status */}
      <div className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>Project Status</p>
          <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{STATUS_LABELS[status] ?? status}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["DRAFT", "IN_REVIEW", "ARCHIVED"].map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={saving}
              className="text-xs tracking-widest uppercase px-4 py-2 border rounded-sm transition-colors"
              style={{
                borderColor: status === s ? "#8B7355" : "#E0DCD6",
                color: status === s ? "#8B7355" : "#7A7A7A",
                backgroundColor: status === s ? "#F0EDE8" : "#FFFFFF",
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Publish button */}
      {!isPublished ? (
        <button
          onClick={publishProject}
          disabled={!canPublish || saving}
          className="w-full py-4 text-sm tracking-widest uppercase transition-opacity"
          style={{
            backgroundColor: "#8B7355",
            color: "#FFFFFF",
            opacity: (!canPublish || saving) ? 0.5 : 1,
          }}
        >
          {saving ? "Publishing..." : "Publish to Client"}
        </button>
      ) : (
        <div>
          <div className="w-full py-4 text-center text-sm tracking-widest uppercase rounded-sm" style={{ backgroundColor: "#E8F5E9", color: "#4A7B5B" }}>
            ✓ Published — Client can view this project
          </div>
          <button
            onClick={() => changeStatus("DRAFT")}
            disabled={saving}
            className="mt-3 w-full py-2.5 text-xs tracking-widest uppercase border rounded-sm transition-colors hover:border-[#8B7355]"
            style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}
          >
            Unpublish (move back to Draft)
          </button>
        </div>
      )}

      {!canPublish && !isPublished && (
        <p className="text-xs text-center" style={{ color: "#C62828" }}>
          Complete the checklist above before publishing.
        </p>
      )}
    </div>
  );
}
