"use client";

import { useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: { name: string; role: string };
}

interface Props {
  projectId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export default function ClientComments({ projectId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitComment() {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    const comment = await res.json();
    if (res.ok) {
      setComments((prev) => [...prev, comment]);
      setContent("");
    }
    setSubmitting(false);
  }

  return (
    <div>
      {/* Existing comments */}
      {comments.length === 0 ? (
        <div className="mb-6 p-6 border rounded-sm text-center" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>No comments yet. Leave your thoughts below.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => {
            const isDesigner = comment.user.role === "DESIGNER" || comment.user.role === "ADMIN";
            return (
              <div
                key={comment.id}
                className="p-5 border rounded-sm"
                style={{
                  borderColor: isDesigner ? "#8B7355" : "#E0DCD6",
                  backgroundColor: isDesigner ? "#FBF9F7" : "#FFFFFF",
                  borderLeftWidth: isDesigner ? "3px" : "1px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium" style={{ color: isDesigner ? "#8B7355" : "#1A1A1A" }}>
                    {comment.user.name} {isDesigner && "· Designer"}
                  </p>
                  <p className="text-xs" style={{ color: "#9E9E9E" }}>
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* New comment */}
      <div className="p-5 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
        <label className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>
          Leave a comment
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, feedback, or questions..."
          rows={3}
          className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-none mb-3"
          style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
        />
        <div className="flex justify-end">
          <button
            onClick={submitComment}
            disabled={submitting || !content.trim()}
            className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: (!content.trim() || submitting) ? 0.5 : 1 }}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}
