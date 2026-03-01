"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface LibraryPhoto {
  name: string;
  url: string;
  createdAt: string;
}

interface Props {
  onAdd: (urls: string[]) => void;
  onClose: () => void;
  existingUrls: string[];
  projectId?: string;
}

export default function PhotoPicker({ onAdd, onClose, existingUrls, projectId }: Props) {
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const endpoint = projectId ? `/api/projects/${projectId}/photos` : "/api/photos";
    const res = await fetch(endpoint);
    const data = await res.json();
    setPhotos(Array.isArray(data) ? data.map((p: { url: string; name: string; createdAt: string }) => ({ name: p.name, url: p.url, createdAt: p.createdAt })) : []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  function toggleSelect(url: string) {
    if (existingUrls.includes(url)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);

    const uploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "room-photos");
      if (projectId) formData.append("folder", `projects/${projectId}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed."); break; }
      if (data.url) uploaded.push(data.url);
    }

    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);

    if (uploaded.length > 0) {
      setSelected((prev) => { const next = new Set(prev); uploaded.forEach((u) => next.add(u)); return next; });
      await fetchPhotos();
      setTab("library");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(26,26,26,0.7)" }}>
      <div className="w-full max-w-3xl rounded-sm overflow-hidden shadow-2xl" style={{ backgroundColor: "#FFFFFF", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "#E0DCD6" }}>
          <div>
            <h2 className="text-2xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Photo Library</h2>
            <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>
              {projectId ? "Project photos" : "All photos"} — select to add to this room.
            </p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#7A7A7A" }}>×</button>
        </div>

        <div className="flex border-b px-8" style={{ borderColor: "#E0DCD6" }}>
          {(["library", "upload"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="text-xs tracking-widest uppercase py-3 mr-8 border-b-2 transition-colors"
              style={{ borderColor: tab === t ? "#8B7355" : "transparent", color: tab === t ? "#8B7355" : "#7A7A7A" }}>
              {t === "library" ? "Library" : "Upload New"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {tab === "library" ? (
            loading ? (
              <p className="text-sm" style={{ color: "#7A7A7A" }}>Loading library...</p>
            ) : photos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No photos yet</p>
                <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>Upload photos to build your library.</p>
                <button onClick={() => setTab("upload")} className="text-xs tracking-widest uppercase px-5 py-2.5" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
                  Upload Photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo) => {
                  const isExisting = existingUrls.includes(photo.url);
                  const isSelected = selected.has(photo.url);
                  return (
                    <button key={photo.url} onClick={() => toggleSelect(photo.url)} disabled={isExisting}
                      className="relative rounded-sm overflow-hidden border-2 transition-all"
                      style={{ borderColor: isSelected ? "#8B7355" : "#E0DCD6", opacity: isExisting ? 0.5 : 1, cursor: isExisting ? "not-allowed" : "pointer" }}>
                      <div className="relative h-28">
                        <Image src={photo.url} alt={photo.name} fill className="object-cover" unoptimized />
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>✓</div>
                      )}
                      {isExisting && (
                        <div className="absolute inset-0 flex items-end justify-center pb-2" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                          <span className="text-xs tracking-widest uppercase" style={{ color: "#FFFFFF" }}>Added</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              <div
                className="w-full border-2 border-dashed rounded-sm py-16 flex flex-col items-center cursor-pointer hover:border-[#8B7355] transition-colors"
                style={{ borderColor: uploadError ? "#C62828" : "#E0DCD6" }}
                onClick={() => !uploading && fileRef.current?.click()}
              >
                {uploading ? (
                  <p className="text-sm" style={{ color: "#8B7355" }}>Uploading...</p>
                ) : (
                  <>
                    <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>Click to select photos</p>
                    <p className="text-xs" style={{ color: "#7A7A7A" }}>Multiple files supported.</p>
                  </>
                )}
              </div>
              {uploadError && <p className="mt-3 text-xs" style={{ color: "#C62828" }}>{uploadError}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xs" style={{ color: "#7A7A7A" }}>
            {selected.size > 0 ? `${selected.size} photo${selected.size > 1 ? "s" : ""} selected` : "No photos selected"}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="text-xs tracking-widest uppercase px-5 py-2.5 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>Cancel</button>
            <button onClick={() => onAdd(Array.from(selected))} disabled={selected.size === 0}
              className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity"
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: selected.size === 0 ? 0.5 : 1 }}>
              Add {selected.size > 0 ? `${selected.size} Photo${selected.size > 1 ? "s" : ""}` : "Photos"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
