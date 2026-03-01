"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PublishButton from "./PublishButton";

interface Render {
  id: string;
  status: string;
  style: string | null;
  designNotes: string | null;
  sourcePhotoUrl: string | null;
  gptAnalysis: string | null;
  claudePrompt: string | null;
  generatedImageUrl: string | null;
  isPublished: boolean;
  createdAt: Date | string;
}

interface Props {
  renders: Render[];
  projectId: string;
  roomId: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING:    { bg: "#F0EDE8", text: "#8B7355" },
  GENERATING: { bg: "#FFF8E7", text: "#B8860B" },
  COMPLETED:  { bg: "#E8F5E9", text: "#4A7B5B" },
  FAILED:     { bg: "#FFEBEE", text: "#C62828" },
  PUBLISHED:  { bg: "#E3F2FD", text: "#1565C0" },
};

export default function RendersGrid({ renders, projectId, roomId }: Props) {
  const [lightbox, setLightbox] = useState<Render | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const generateHref = `/designer/projects/${projectId}/rooms/${roomId}/renders`;

  if (renders.length === 0) {
    return (
      <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
        <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No renders yet</p>
        <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Add room photos first, then generate an AI render.</p>
        <Link href={generateHref} className="text-xs tracking-widest uppercase px-6 py-3" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          Generate Render
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Renders ({renders.length})
        </h2>
        <Link href={generateHref} className="text-xs tracking-widest uppercase px-5 py-2.5" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          + New Render
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renders.map((render) => {
          const colors = STATUS_COLORS[render.status] ?? STATUS_COLORS.PENDING;
          return (
            <div key={render.id} className="border rounded-sm overflow-hidden" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
              {render.generatedImageUrl ? (
                <button
                  className="relative h-56 w-full block cursor-zoom-in"
                  onClick={() => setLightbox(render)}
                >
                  <Image src={render.generatedImageUrl} alt="Generated render" fill className="object-cover" unoptimized />
                  <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-sm" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}>
                    Click to expand
                  </span>
                </button>
              ) : (
                <div className="h-56 flex items-center justify-center" style={{ backgroundColor: "#F0EDE8" }}>
                  <p className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>
                    {render.status === "GENERATING" ? "Generating..." : "No image"}
                  </p>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-widest uppercase px-2 py-1 rounded-sm" style={{ backgroundColor: colors.bg, color: colors.text }}>
                    {render.status}
                  </span>
                  <span className="text-xs" style={{ color: "#7A7A7A" }}>
                    {new Date(render.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {render.style && <p className="text-xs mb-1" style={{ color: "#4A4A4A" }}>Style: {render.style}</p>}
                {render.designNotes && (
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: "#7A7A7A" }}>{render.designNotes}</p>
                )}
                {render.status === "COMPLETED" && !render.isPublished && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "#E0DCD6" }}>
                    <PublishButton renderId={render.id} />
                  </div>
                )}
                {render.isPublished && (
                  <p className="mt-3 text-xs tracking-widest uppercase" style={{ color: "#1565C0" }}>✓ Published to client</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-6 text-4xl leading-none font-light"
            onClick={() => setLightbox(null)}
            style={{ color: "#FFFFFF" }}
          >
            ×
          </button>

          <div className="flex gap-8 items-start max-w-6xl w-full px-8" onClick={(e) => e.stopPropagation()}>
            {/* Main image */}
            <div className="flex-1">
              {lightbox.generatedImageUrl && (
                <img
                  src={lightbox.generatedImageUrl}
                  alt="Render full view"
                  style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain" }}
                />
              )}
            </div>

            {/* Side panel */}
            <div className="w-80 shrink-0 py-2" style={{ color: "#FFFFFF" }}>
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#9E9E9E" }}>Render Details</p>

              {lightbox.style && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>Style</p>
                  <p className="text-sm">{lightbox.style}</p>
                </div>
              )}

              {lightbox.sourcePhotoUrl && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#9E9E9E" }}>Source Photo</p>
                  <div className="relative h-28 rounded-sm overflow-hidden">
                    <Image src={lightbox.sourcePhotoUrl} alt="Source" fill className="object-cover" unoptimized />
                  </div>
                </div>
              )}

              {lightbox.designNotes && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>Design Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#E0DCD6" }}>{lightbox.designNotes}</p>
                </div>
              )}

              {lightbox.gptAnalysis && (
                <div className="mb-4">
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#9E9E9E" }}>GPT-4o Room Analysis</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#9E9E9E" }}>{lightbox.gptAnalysis}</p>
                </div>
              )}

              <p className="text-xs" style={{ color: "#616161" }}>
                Generated {new Date(lightbox.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
