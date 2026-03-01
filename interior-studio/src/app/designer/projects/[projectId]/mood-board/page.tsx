"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface MoodBoardItem { id: string; imageUrl: string; caption: string | null; }
interface MoodBoard { id: string; title: string; items: MoodBoardItem[]; }

export default function MoodBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => { setBoards(data.moodBoards || []); setLoading(false); });
  }, [projectId]);

  async function ensureBoard(): Promise<string> {
    if (boards.length > 0) return boards[0].id;
    const res = await fetch(`/api/projects/${projectId}/mood-boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Mood Board" }),
    });
    const board = await res.json();
    setBoards([{ ...board, items: [] }]);
    return board.id;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const boardId = await ensureBoard();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "mood-boards");

    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await uploadRes.json();

    await fetch(`/api/projects/${projectId}/mood-boards/${boardId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });

    const refresh = await fetch(`/api/projects/${projectId}`).then((r) => r.json());
    setBoards(refresh.moodBoards || []);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(boardId: string, itemId: string) {
    await fetch(`/api/projects/${projectId}/mood-boards/${boardId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const refresh = await fetch(`/api/projects/${projectId}`).then((r) => r.json());
    setBoards(refresh.moodBoards || []);
  }

  const allItems = boards.flatMap((b) => b.items.map((i) => ({ ...i, boardId: b.id })));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Mood Board
        </h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs tracking-widest uppercase px-5 py-2.5"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}
          >
            {uploading ? "Uploading..." : "+ Add Image"}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#7A7A7A" }}>Loading...</p>
      ) : allItems.length === 0 ? (
        <div className="text-center py-24 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>
            No images yet
          </p>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>Upload inspiration images to build the mood board.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {allItems.map((item) => (
            <div key={item.id} className="relative group break-inside-avoid">
              <div className="relative overflow-hidden rounded-sm">
                <Image
                  src={item.imageUrl}
                  alt={item.caption || "Mood board image"}
                  width={400}
                  height={300}
                  className="w-full object-cover"
                  unoptimized
                />
                <button
                  onClick={() => handleDelete(item.boardId, item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  style={{ backgroundColor: "rgba(26,26,26,0.7)", color: "#FFFFFF" }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
