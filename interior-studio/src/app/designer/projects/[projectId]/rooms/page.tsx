"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Room { id: string; name: string; originalPhotoUrl: string | null; renders: { id: string }[]; }

export default function RoomsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => { setRooms(data.rooms || []); setLoading(false); });
  }, [projectId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName) return;
    setSaving(true);

    let photoUrl: string | undefined;
    if (pendingFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("bucket", "room-photos");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();
      photoUrl = url;
      setUploading(false);
    }

    const res = await fetch(`/api/projects/${projectId}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName, originalPhotoUrl: photoUrl }),
    });
    const room = await res.json();
    setRooms((prev) => [...prev, { ...room, renders: [] }]);
    setRoomName("");
    setPendingFile(null);
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Rooms</h1>
        <button onClick={() => setShowForm(true)} className="text-xs tracking-widest uppercase px-5 py-2.5"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          + Add Room
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-8 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase mb-6" style={{ color: "#8B7355" }}>New Room</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>ROOM NAME</Label>
              <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Living Room"
                required style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>ROOM PHOTO (OPTIONAL)</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setPendingFile(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs tracking-widest uppercase px-4 py-2 border"
                  style={{ borderColor: "#E0DCD6", color: "#4A4A4A" }}>
                  Choose File
                </button>
                {pendingFile && <span className="text-xs" style={{ color: "#7A7A7A" }}>{pendingFile.name}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={saving || uploading}
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", border: "none" }}>
              {uploading ? "Uploading..." : saving ? "Creating..." : "Create Room"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} style={{ color: "#7A7A7A" }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? <p style={{ color: "#7A7A7A" }}>Loading...</p> : rooms.length === 0 ? (
        <div className="text-center py-24 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No rooms yet</p>
          <p className="text-sm mt-1" style={{ color: "#7A7A7A" }}>Add rooms to start generating AI design renders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link key={room.id} href={`/designer/projects/${projectId}/rooms/${room.id}`}
              className="border rounded-sm overflow-hidden hover:border-[#8B7355] transition-colors group"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
              <div className="relative h-48 bg-[#F0EDE8]">
                {room.originalPhotoUrl ? (
                  <Image src={room.originalPhotoUrl} alt={room.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>No photo</p>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-light text-lg" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{room.name}</p>
                <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>{room.renders.length} renders</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
