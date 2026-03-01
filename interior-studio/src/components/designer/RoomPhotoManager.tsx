"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PhotoPicker from "./PhotoPicker";

interface Props {
  roomId: string;
  initialPhotos: string[];
  initialPrimary: string | null;
  projectId?: string;
}

export default function RoomPhotoManager({ roomId, initialPhotos, initialPrimary, projectId }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos ?? []);
  const [primary, setPrimary] = useState<string | null>(initialPrimary ?? null);
  const [showPicker, setShowPicker] = useState(false);
  const [working, setWorking] = useState(false);
  const router = useRouter();

  async function patch(body: Record<string, string | string[]>) {
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function handleAdd(urls: string[]) {
    setShowPicker(false);
    if (!urls.length) return;
    setWorking(true);
    let current = { photoUrls: photos, originalPhotoUrl: primary };
    for (const url of urls) {
      const updated = await patch({ addPhoto: url });
      current = updated;
    }
    setPhotos(current.photoUrls ?? []);
    setPrimary(current.originalPhotoUrl ?? null);
    setWorking(false);
    router.refresh();
  }

  async function handleRemove(url: string) {
    setWorking(true);
    const updated = await patch({ removePhoto: url });
    setPhotos(updated.photoUrls ?? []);
    setPrimary(updated.originalPhotoUrl ?? null);
    setWorking(false);
    router.refresh();
  }

  async function handleSetPrimary(url: string) {
    setWorking(true);
    const updated = await patch({ setPrimary: url });
    setPrimary(updated.originalPhotoUrl ?? null);
    setWorking(false);
    router.refresh();
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Room Photos</h2>
            <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>
              The ★ primary photo is used as the source for AI generation.
            </p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            disabled={working}
            className="text-xs tracking-widest uppercase px-4 py-2 border transition-colors"
            style={{ borderColor: "#8B7355", color: "#8B7355" }}
          >
            {working ? "Saving..." : "+ Add Photos"}
          </button>
        </div>

        {photos.length === 0 ? (
          <div
            className="border-2 border-dashed rounded-sm py-16 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B7355] transition-colors"
            style={{ borderColor: "#E0DCD6" }}
            onClick={() => setShowPicker(true)}
          >
            <p className="text-sm font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No photos yet</p>
            <p className="text-xs" style={{ color: "#7A7A7A" }}>Click to add room photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((url) => {
              const isPrimary = url === primary;
              return (
                <div key={url} className="relative group rounded-sm overflow-hidden border-2 transition-colors" style={{ borderColor: isPrimary ? "#8B7355" : "#E0DCD6" }}>
                  <div className="relative h-36">
                    <Image src={url} alt="Room photo" fill className="object-cover" unoptimized />
                  </div>
                  {isPrimary && (
                    <div className="absolute top-2 left-2 text-xs px-2 py-0.5 tracking-widest" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>★ Primary</div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(26,26,26,0.6)" }}>
                    {!isPrimary && (
                      <button onClick={() => handleSetPrimary(url)} className="text-xs tracking-widest uppercase px-3 py-1.5 rounded-sm" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
                        Set Primary
                      </button>
                    )}
                    <button onClick={() => handleRemove(url)} className="text-xs tracking-widest uppercase px-3 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setShowPicker(true)}
              className="h-36 border-2 border-dashed rounded-sm flex items-center justify-center hover:border-[#8B7355] transition-colors"
              style={{ borderColor: "#E0DCD6" }}
            >
              <span className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>+ Add</span>
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <PhotoPicker
          existingUrls={photos}
          onAdd={handleAdd}
          onClose={() => setShowPicker(false)}
          projectId={projectId}
        />
      )}
    </>
  );
}
