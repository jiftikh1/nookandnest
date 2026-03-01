"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Update { id: string; title: string; body: string; createdAt: string; }

export default function UpdatesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setUpdates(data.updates || []));
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const update = await res.json();
    setUpdates((prev) => [update, ...prev]);
    setTitle("");
    setBody("");
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Project Updates</h1>
        <button onClick={() => setShowForm(true)} className="text-xs tracking-widest uppercase px-5 py-2.5"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          + Post Update
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-8 border rounded-sm space-y-4"
          style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase" style={{ color: "#8B7355" }}>New Update</h2>
          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>TITLE</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="e.g. Mood board finalised"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>MESSAGE</Label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5}
              placeholder="Share progress, decisions, or next steps with your client..."
              className="w-full px-3 py-2 text-sm border rounded-sm resize-none outline-none"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5", color: "#4A4A4A" }} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", border: "none" }}>
              {saving ? "Posting..." : "Post Update"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} style={{ color: "#7A7A7A" }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-sm" style={{ color: "#7A7A7A" }}>No updates posted yet.</p>
        ) : updates.map((u) => (
          <div key={u.id} className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium" style={{ color: "#1A1A1A" }}>{u.title}</h3>
              <span className="text-xs" style={{ color: "#7A7A7A" }}>
                {new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "#4A4A4A" }}>{u.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
