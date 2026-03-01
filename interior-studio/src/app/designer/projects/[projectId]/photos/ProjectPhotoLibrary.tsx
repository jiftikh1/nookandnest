"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface Room { id: string; name: string; }

interface ProjectPhoto {
  name: string;
  url: string;
  createdAt: string;
  rooms: Room[];
}

interface Props {
  projectId: string;
  rooms: Room[];
}

export default function ProjectPhotoLibrary({ projectId, rooms: initialRooms }: Props) {
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [taggingPhoto, setTaggingPhoto] = useState<ProjectPhoto | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/photos`);
    const data = await res.json();
    setPhotos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "room-photos");
      fd.append("folder", `projects/${projectId}`);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed."); break; }
    }
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    await fetchPhotos();
  }

  async function tagToRoom(photoUrl: string, roomId: string) {
    setWorking(photoUrl);
    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addPhoto: photoUrl }),
    });
    await fetchPhotos();
    setWorking(null);
    setTaggingPhoto(null);
  }

  async function untagFromRoom(photoUrl: string, roomId: string) {
    setWorking(photoUrl);
    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removePhoto: photoUrl }),
    });
    await fetchPhotos();
    setWorking(null);
  }

  async function createRoomAndTag(photoUrl: string) {
    if (!newRoomName.trim()) return;
    setCreatingRoom(true);
    const res = await fetch(`/api/projects/${projectId}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoomName.trim() }),
    });
    const room = await res.json();
    setRooms((prev) => [...prev, { id: room.id, name: room.name }]);
    setNewRoomName("");
    setCreatingRoom(false);
    await tagToRoom(photoUrl, room.id);
  }

  async function deletePhoto(photoUrl: string) {
    if (!confirm("Delete this photo? It will be removed from all rooms.")) return;
    setWorking(photoUrl);
    await fetch(`/api/projects/${projectId}/photos?url=${encodeURIComponent(photoUrl)}`, { method: "DELETE" });
    await fetchPhotos();
    setWorking(null);
  }

  const untagged = photos.filter((p) => p.rooms.length === 0);
  const tagged = photos.filter((p) => p.rooms.length > 0);

  return (
    <div>
      {/* Upload area */}
      <div className="mb-10">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <div
          className="border-2 border-dashed rounded-sm py-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B7355] transition-colors"
          style={{ borderColor: uploadError ? "#C62828" : "#E0DCD6" }}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {uploading ? (
            <p className="text-sm" style={{ color: "#8B7355" }}>Uploading...</p>
          ) : (
            <>
              <p className="text-lg font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>
                Click or drag to upload photos
              </p>
              <p className="text-xs" style={{ color: "#7A7A7A" }}>Up to 20 at a time. Photos appear in the inbox below.</p>
            </>
          )}
        </div>
        {uploadError && <p className="mt-2 text-xs" style={{ color: "#C62828" }}>{uploadError}</p>}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "#7A7A7A" }}>Loading photos...</p>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No photos yet</p>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>Upload photos above to get started.</p>
        </div>
      ) : (
        <>
          {/* Untagged Inbox */}
          {untagged.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                  Untagged Inbox
                </h2>
                <span className="text-xs tracking-widest uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF8E7", color: "#B8860B" }}>
                  {untagged.length} unassigned
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {untagged.map((photo) => (
                  <PhotoCard
                    key={photo.url}
                    photo={photo}
                    rooms={rooms}
                    working={working === photo.url}
                    onTag={() => setTaggingPhoto(photo)}
                    onDelete={() => deletePhoto(photo.url)}
                    onUntag={(roomId) => untagFromRoom(photo.url, roomId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tagged photos */}
          {tagged.length > 0 && (
            <div>
              <h2 className="text-lg font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                Tagged Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tagged.map((photo) => (
                  <PhotoCard
                    key={photo.url}
                    photo={photo}
                    rooms={rooms}
                    working={working === photo.url}
                    onTag={() => setTaggingPhoto(photo)}
                    onDelete={() => deletePhoto(photo.url)}
                    onUntag={(roomId) => untagFromRoom(photo.url, roomId)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tag modal */}
      {taggingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,26,26,0.7)" }}
          onClick={() => setTaggingPhoto(null)}
        >
          <div
            className="w-full max-w-sm rounded-sm overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "#E0DCD6" }}>
              <h3 className="text-xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                Tag Photo to Room
              </h3>
            </div>

            {/* Existing rooms */}
            <div className="px-6 py-4 max-h-60 overflow-y-auto">
              {rooms.filter((r) => !taggingPhoto.rooms.some((tr) => tr.id === r.id)).length === 0 ? (
                <p className="text-sm mb-3" style={{ color: "#7A7A7A" }}>All rooms are already tagged.</p>
              ) : (
                <div className="space-y-2">
                  {rooms
                    .filter((r) => !taggingPhoto.rooms.some((tr) => tr.id === r.id))
                    .map((room) => (
                      <button
                        key={room.id}
                        onClick={() => tagToRoom(taggingPhoto.url, room.id)}
                        className="w-full text-left px-4 py-2.5 border rounded-sm hover:border-[#8B7355] transition-colors text-sm"
                        style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
                      >
                        {room.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Create new room */}
            <div className="px-6 py-4 border-t" style={{ borderColor: "#E0DCD6" }}>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>
                Or create a new room
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room name..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createRoomAndTag(taggingPhoto.url)}
                  className="flex-1 text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
                  style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
                />
                <button
                  onClick={() => createRoomAndTag(taggingPhoto.url)}
                  disabled={!newRoomName.trim() || creatingRoom}
                  className="text-xs tracking-widest uppercase px-4 py-2 transition-opacity"
                  style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !newRoomName.trim() ? 0.5 : 1 }}
                >
                  {creatingRoom ? "..." : "Create"}
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "#E0DCD6" }}>
              <button
                onClick={() => setTaggingPhoto(null)}
                className="text-xs tracking-widest uppercase px-5 py-2 border"
                style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCard({
  photo, rooms, working, onTag, onDelete, onUntag,
}: {
  photo: ProjectPhoto;
  rooms: Room[];
  working: boolean;
  onTag: () => void;
  onDelete: () => void;
  onUntag: (roomId: string) => void;
}) {
  const untaggedRooms = rooms.filter((r) => !photo.rooms.some((pr) => pr.id === r.id));

  return (
    <div
      className="border rounded-sm overflow-hidden"
      style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF", opacity: working ? 0.6 : 1 }}
    >
      <div className="relative h-40">
        <Image src={photo.url} alt={photo.name} fill className="object-cover" unoptimized />
      </div>
      <div className="p-3">
        {/* Room chips */}
        <div className="flex flex-wrap gap-1 mb-2 min-h-[22px]">
          {photo.rooms.length === 0 ? (
            <span className="text-xs" style={{ color: "#B8860B" }}>Untagged</span>
          ) : (
            photo.rooms.map((room) => (
              <span key={room.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F5E9", color: "#4A7B5B" }}>
                {room.name}
                <button onClick={() => onUntag(room.id)} disabled={working} className="hover:text-red-500 transition-colors">×</button>
              </span>
            ))
          )}
        </div>

        <button
          onClick={onTag}
          disabled={working || untaggedRooms.length === 0 && photo.rooms.length > 0}
          className="w-full text-xs tracking-widest uppercase py-1.5 border rounded-sm mb-1.5 hover:border-[#8B7355] hover:text-[#8B7355] transition-colors"
          style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}
        >
          + Tag to Room
        </button>

        <button
          onClick={onDelete}
          disabled={working}
          className="w-full text-xs tracking-widest uppercase py-1.5 border rounded-sm hover:border-red-300 hover:text-red-500 transition-colors"
          style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
