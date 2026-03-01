"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MoodBoardItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
}

interface MoodBoard {
  id: string;
  title: string;
  description: string | null;
  items: MoodBoardItem[];
}

interface Props {
  roomId: string;
  initialBoards: MoodBoard[];
}

export default function MoodBoardManager({ roomId, initialBoards }: Props) {
  const [boards, setBoards] = useState<MoodBoard[]>(initialBoards);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function createBoard() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/rooms/${roomId}/mood-boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const board = await res.json();
    setBoards((prev) => [...prev, board]);
    setNewTitle("");
    setCreating(false);
  }

  async function deleteBoard(boardId: string) {
    if (!confirm("Delete this mood board?")) return;
    await fetch(`/api/rooms/${roomId}/mood-boards/${boardId}`, { method: "DELETE" });
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  }

  async function uploadItem(boardId: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "mood-boards");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    if (!url) return;

    const itemRes = await fetch(`/api/rooms/${roomId}/mood-boards/${boardId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    const item = await itemRes.json();
    setBoards((prev) =>
      prev.map((b) => b.id === boardId ? { ...b, items: [...b.items, item] } : b)
    );
  }

  async function deleteItem(boardId: string, itemId: string) {
    await fetch(`/api/rooms/${roomId}/mood-boards/${boardId}/items?itemId=${itemId}`, { method: "DELETE" });
    setBoards((prev) =>
      prev.map((b) => b.id === boardId ? { ...b, items: b.items.filter((i) => i.id !== itemId) } : b)
    );
  }

  async function updateCaption(boardId: string, itemId: string, caption: string) {
    await fetch(`/api/rooms/${roomId}/mood-boards/${boardId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, caption }),
    });
  }

  return (
    <div>
      {boards.length === 0 && !creating && (
        <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No mood boards yet</p>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Create boards to collect inspiration images for this room.</p>
          <button
            onClick={() => setCreating(true)}
            className="text-xs tracking-widest uppercase px-6 py-3"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}
          >
            + Create Board
          </button>
        </div>
      )}

      {boards.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm" style={{ color: "#7A7A7A" }}>{boards.length} board{boards.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => setCreating(true)}
            className="text-xs tracking-widest uppercase px-5 py-2.5 border"
            style={{ borderColor: "#8B7355", color: "#8B7355" }}
          >
            + New Board
          </button>
        </div>
      )}

      {creating && (
        <div className="mb-6 p-5 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>New Mood Board</p>
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Board title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createBoard()}
              className="flex-1 text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
            />
            <button onClick={createBoard} disabled={!newTitle.trim()} className="text-xs tracking-widest uppercase px-5 py-2" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
              Create
            </button>
            <button onClick={() => setCreating(false)} className="text-xs tracking-widest uppercase px-4 py-2 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {boards.map((board) => (
          <div key={board.id} className="border rounded-sm overflow-hidden" style={{ borderColor: "#E0DCD6" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
              <h3 className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{board.title}</h3>
              <div className="flex gap-3">
                <input
                  ref={(el) => { fileRefs.current[board.id] = el; }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    for (const file of files) await uploadItem(board.id, file);
                    if (e.target) e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRefs.current[board.id]?.click()}
                  className="text-xs tracking-widest uppercase px-4 py-1.5 border"
                  style={{ borderColor: "#8B7355", color: "#8B7355" }}
                >
                  + Add Images
                </button>
                <button onClick={() => deleteBoard(board.id)} className="text-xs tracking-widest uppercase px-4 py-1.5 border hover:border-red-300 hover:text-red-500 transition-colors" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
                  Delete
                </button>
              </div>
            </div>

            {board.items.length === 0 ? (
              <div
                className="py-12 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F9F7F5] transition-colors"
                onClick={() => fileRefs.current[board.id]?.click()}
              >
                <p className="text-sm" style={{ color: "#7A7A7A" }}>Click to add images to this board</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {board.items.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="relative h-36 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                      <Image src={item.imageUrl} alt={item.caption ?? ""} fill className="object-cover" unoptimized />
                      <button
                        onClick={() => deleteItem(board.id, item.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      defaultValue={item.caption ?? ""}
                      placeholder="Caption..."
                      onBlur={(e) => updateCaption(board.id, item.id, e.target.value)}
                      className="mt-1 w-full text-xs px-1 py-0.5 border-0 border-b focus:outline-none focus:border-[#8B7355]"
                      style={{ borderColor: "#E0DCD6", color: "#4A4A4A" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
