"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Render {
  id: string;
  style: string | null;
  designNotes: string | null;
  sourcePhotoUrl: string | null;
  gptAnalysis: string | null;
  generatedImageUrl: string | null;
  createdAt: Date | string;
}

interface Props {
  renders: Render[];
}

export default function ClientRenderGallery({ renders }: Props) {
  const [lightbox, setLightbox] = useState<Render | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {renders.map((render) => render.generatedImageUrl && (
          <button
            key={render.id}
            onClick={() => setLightbox(render)}
            className="relative h-56 rounded-sm overflow-hidden border cursor-zoom-in group"
            style={{ borderColor: "#E0DCD6" }}
          >
            <Image src={render.generatedImageUrl} alt="Design render" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
            <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}>
              Click to expand
            </span>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-5 right-6 text-4xl leading-none font-light" onClick={() => setLightbox(null)} style={{ color: "#FFFFFF" }}>×</button>

          <div className="flex gap-8 items-start max-w-6xl w-full px-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1">
              {lightbox.generatedImageUrl && (
                <img src={lightbox.generatedImageUrl} alt="Design render" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain" }} />
              )}
            </div>

            <div className="w-72 shrink-0 py-2" style={{ color: "#FFFFFF" }}>
              <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "#9E9E9E" }}>Render Details</p>

              {lightbox.style && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>Style</p>
                  <p className="text-sm">{lightbox.style}</p>
                </div>
              )}

              {lightbox.sourcePhotoUrl && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#9E9E9E" }}>Based on</p>
                  <div className="relative h-24 rounded-sm overflow-hidden">
                    <Image src={lightbox.sourcePhotoUrl} alt="Source" fill className="object-cover" unoptimized />
                  </div>
                </div>
              )}

              {lightbox.designNotes && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>Designer Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#E0DCD6" }}>{lightbox.designNotes}</p>
                </div>
              )}

              {lightbox.gptAnalysis && (
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>AI Room Analysis</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#757575" }}>{lightbox.gptAnalysis}</p>
                </div>
              )}

              <p className="text-xs mt-5" style={{ color: "#424242" }}>
                {new Date(lightbox.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
