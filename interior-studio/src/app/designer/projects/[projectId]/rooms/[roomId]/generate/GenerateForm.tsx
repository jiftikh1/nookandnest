"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RUG_STYLES = ["Persian", "Modern", "Geometric", "Shaggy", "Runner", "Jute/Natural"];
const RUG_SIZES = ["Small (2×3)", "Medium (5×8)", "Large (8×10)", "Extra Large"];
const FURNITURE_ITEMS = ["Sofa", "Armchair", "Coffee Table", "Side Table", "Dining Set", "Bed Frame", "Wardrobe", "Bookshelf", "Desk & Chair"];
const FURNITURE_STYLES = ["Modern", "Scandinavian", "Mid-Century", "Traditional", "Industrial", "Bohemian"];
const LIGHT_ITEMS = ["Pendant Light", "Floor Lamp", "Table Lamp", "Chandelier", "Wall Sconces"];
const LIGHT_FINISHES = ["Brass", "Chrome", "Matte Black", "White", "Antique Bronze"];

interface Props {
  projectId: string;
  roomId: string;
  photos: string[];
  primaryPhoto: string | null;
}

function buildDesignNotes({
  rug, furniture, lighting, extraNotes,
}: {
  rug: { enabled: boolean; style: string; size: string; color: string };
  furniture: { items: string[]; style: string; color: string };
  lighting: { items: string[]; finish: string };
  extraNotes: string;
}): string {
  const parts: string[] = [];

  if (rug.enabled && rug.style) {
    parts.push(`Add a ${rug.size} ${rug.style} rug${rug.color ? ` in ${rug.color}` : ""} in the center of the room`);
  }
  if (furniture.items.length > 0) {
    const itemList = furniture.items.join(", ").toLowerCase();
    parts.push(`Add ${itemList}${furniture.style ? ` in ${furniture.style} style` : ""}${furniture.color ? `, ${furniture.color} finish/material` : ""}`);
  }
  if (lighting.items.length > 0) {
    const lightList = lighting.items.join(", ").toLowerCase();
    parts.push(`Add ${lightList}${lighting.finish ? ` with ${lighting.finish} finish` : ""}`);
  }
  if (extraNotes.trim()) {
    parts.push(extraNotes.trim());
  }

  if (parts.length === 0) return "";

  return `ADD ITEMS ONLY — keep all existing wall colors, flooring, ceiling, architectural elements, and any existing furniture COMPLETELY UNCHANGED. Only add the following items:\n${parts.map((p) => `- ${p}`).join("\n")}`;
}

export default function GenerateForm({ projectId, roomId, photos, primaryPhoto }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sourcePhoto, setSourcePhoto] = useState<string>(primaryPhoto ?? photos[0] ?? "");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Item selections
  const [rug, setRug] = useState({ enabled: false, style: "", size: "Medium (5×8)", color: "" });
  const [furniture, setFurniture] = useState({ items: [] as string[], style: "", color: "" });
  const [lighting, setLighting] = useState({ items: [] as string[], finish: "" });
  const [extraNotes, setExtraNotes] = useState("");

  function toggleFurnitureItem(item: string) {
    setFurniture((f) => ({
      ...f,
      items: f.items.includes(item) ? f.items.filter((i) => i !== item) : [...f.items, item],
    }));
  }
  function toggleLightItem(item: string) {
    setLighting((l) => ({
      ...l,
      items: l.items.includes(item) ? l.items.filter((i) => i !== item) : [...l.items, item],
    }));
  }

  const hasSelections = rug.enabled || furniture.items.length > 0 || lighting.items.length > 0 || extraNotes.trim().length > 0;
  const designNotes = buildDesignNotes({ rug, furniture, lighting, extraNotes });

  async function handleGenerate() {
    if (!sourcePhoto) { setError("Please select a source photo."); return; }
    if (!hasSelections) { setError("Please select at least one item to add."); return; }
    setGenerating(true);
    setError(null);

    const renderRes = await fetch(`/api/rooms/${roomId}/renders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style: "Photorealistic", designNotes, sourcePhotoUrl: sourcePhoto }),
    });

    if (!renderRes.ok) {
      setError("Failed to create render record.");
      setGenerating(false);
      return;
    }

    const render = await renderRes.json();
    const genRes = await fetch(`/api/renders/${render.id}/generate`, { method: "POST" });

    if (genRes.ok) {
      router.push(`/designer/projects/${projectId}/rooms/${roomId}/renders`);
    } else {
      const data = await genRes.json();
      setError(data.error || "Generation failed. Please try again.");
      setGenerating(false);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed rounded-sm text-center" style={{ borderColor: "#E0DCD6" }}>
        <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No room photos yet</p>
        <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Add at least one photo before generating.</p>
        <a href={`/designer/projects/${projectId}/rooms/${roomId}`} className="text-xs tracking-widest uppercase px-6 py-3" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          Add Photos →
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Step progress */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: "Source Photo" }, { n: 2, label: "Add Items" }, { n: 3, label: "Generate" }].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <button onClick={() => n < step && setStep(n)} disabled={n > step} className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full text-xs flex items-center justify-center font-medium transition-colors"
                style={{ backgroundColor: step >= n ? "#8B7355" : "#E0DCD6", color: step >= n ? "#FFFFFF" : "#7A7A7A" }}>
                {n}
              </span>
              <span className="text-xs tracking-widest uppercase hidden sm:block" style={{ color: step >= n ? "#8B7355" : "#7A7A7A" }}>{label}</span>
            </button>
            {i < arr.length - 1 && <span style={{ color: "#E0DCD6" }}>—</span>}
          </div>
        ))}
      </div>

      {/* ── Step 1: Source photo ── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Step 1 — Pick a Source Photo</h2>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Claude will analyse this photo to understand the room structure.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {photos.map((url) => (
              <button key={url} onClick={() => setSourcePhoto(url)}
                className="relative h-40 rounded-sm overflow-hidden border-2 transition-colors"
                style={{ borderColor: sourcePhoto === url ? "#8B7355" : "#E0DCD6" }}>
                <Image src={url} alt="Room photo" fill className="object-cover" unoptimized />
                {sourcePhoto === url && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center"
                    style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>✓</span>
                )}
                {url === primaryPhoto && (
                  <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-sm"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#FFFFFF" }}>★ Primary</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => sourcePhoto && setStep(2)} disabled={!sourcePhoto}
            className="w-full py-3 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !sourcePhoto ? 0.5 : 1 }}>
            Continue to Add Items →
          </button>
        </div>
      )}

      {/* ── Step 2: Item picker ── */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Step 2 — Add Items</h2>
          <p className="text-sm mb-8" style={{ color: "#7A7A7A" }}>
            Choose what to add. The room structure, walls, and flooring stay exactly as they are.
          </p>

          {/* ─ Carpet / Rug ─ */}
          <div className="mb-8 pb-8 border-b" style={{ borderColor: "#E0DCD6" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium tracking-widest uppercase" style={{ color: "#1A1A1A" }}>Carpet / Rug</h3>
              <button
                onClick={() => setRug((r) => ({ ...r, enabled: !r.enabled }))}
                className="text-xs tracking-widest uppercase px-4 py-1.5 border transition-colors rounded-sm"
                style={{
                  borderColor: rug.enabled ? "#8B7355" : "#E0DCD6",
                  backgroundColor: rug.enabled ? "#8B7355" : "transparent",
                  color: rug.enabled ? "#FFFFFF" : "#7A7A7A",
                }}>
                {rug.enabled ? "✓ Added" : "+ Add Rug"}
              </button>
            </div>
            {rug.enabled && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Style</p>
                  <div className="flex flex-wrap gap-2">
                    {RUG_STYLES.map((s) => (
                      <button key={s} onClick={() => setRug((r) => ({ ...r, style: s }))}
                        className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                        style={{ borderColor: rug.style === s ? "#8B7355" : "#E0DCD6", backgroundColor: rug.style === s ? "#F0EDE8" : "transparent", color: rug.style === s ? "#8B7355" : "#4A4A4A" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Size</p>
                  <div className="flex flex-wrap gap-2">
                    {RUG_SIZES.map((s) => (
                      <button key={s} onClick={() => setRug((r) => ({ ...r, size: s }))}
                        className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                        style={{ borderColor: rug.size === s ? "#8B7355" : "#E0DCD6", backgroundColor: rug.size === s ? "#F0EDE8" : "transparent", color: rug.size === s ? "#8B7355" : "#4A4A4A" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Colour / Pattern <span style={{ color: "#9E9E9E" }}>(optional)</span></p>
                  <input type="text" value={rug.color} onChange={(e) => setRug((r) => ({ ...r, color: e.target.value }))}
                    placeholder="e.g. terracotta tones, navy blue, cream and gold..."
                    className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
                    style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }} />
                </div>
              </div>
            )}
          </div>

          {/* ─ Furniture ─ */}
          <div className="mb-8 pb-8 border-b" style={{ borderColor: "#E0DCD6" }}>
            <h3 className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "#1A1A1A" }}>Furniture</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {FURNITURE_ITEMS.map((item) => {
                const active = furniture.items.includes(item);
                return (
                  <button key={item} onClick={() => toggleFurnitureItem(item)}
                    className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                    style={{ borderColor: active ? "#8B7355" : "#E0DCD6", backgroundColor: active ? "#F0EDE8" : "transparent", color: active ? "#8B7355" : "#4A4A4A" }}>
                    {active ? "✓ " : ""}{item}
                  </button>
                );
              })}
            </div>
            {furniture.items.length > 0 && (
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Style</p>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_STYLES.map((s) => (
                      <button key={s} onClick={() => setFurniture((f) => ({ ...f, style: s }))}
                        className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                        style={{ borderColor: furniture.style === s ? "#8B7355" : "#E0DCD6", backgroundColor: furniture.style === s ? "#F0EDE8" : "transparent", color: furniture.style === s ? "#8B7355" : "#4A4A4A" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Colour / Material <span style={{ color: "#9E9E9E" }}>(optional)</span></p>
                  <input type="text" value={furniture.color} onChange={(e) => setFurniture((f) => ({ ...f, color: e.target.value }))}
                    placeholder="e.g. warm oak, ivory linen, dark walnut..."
                    className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
                    style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }} />
                </div>
              </div>
            )}
          </div>

          {/* ─ Lighting ─ */}
          <div className="mb-8 pb-8 border-b" style={{ borderColor: "#E0DCD6" }}>
            <h3 className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "#1A1A1A" }}>Lighting</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {LIGHT_ITEMS.map((item) => {
                const active = lighting.items.includes(item);
                return (
                  <button key={item} onClick={() => toggleLightItem(item)}
                    className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                    style={{ borderColor: active ? "#8B7355" : "#E0DCD6", backgroundColor: active ? "#F0EDE8" : "transparent", color: active ? "#8B7355" : "#4A4A4A" }}>
                    {active ? "✓ " : ""}{item}
                  </button>
                );
              })}
            </div>
            {lighting.items.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>Finish</p>
                <div className="flex flex-wrap gap-2">
                  {LIGHT_FINISHES.map((f) => (
                    <button key={f} onClick={() => setLighting((l) => ({ ...l, finish: f }))}
                      className="text-xs px-3 py-1.5 border rounded-sm transition-colors"
                      style={{ borderColor: lighting.finish === f ? "#8B7355" : "#E0DCD6", backgroundColor: lighting.finish === f ? "#F0EDE8" : "transparent", color: lighting.finish === f ? "#8B7355" : "#4A4A4A" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─ Extra notes ─ */}
          <div className="mb-8">
            <h3 className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: "#1A1A1A" }}>Additional Details <span className="normal-case font-normal" style={{ color: "#9E9E9E" }}>(optional)</span></h3>
            <textarea value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="e.g. add a potted olive tree in the corner, a large abstract painting on the wall..."
              rows={3}
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-none"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }} />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 text-xs tracking-widest uppercase border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              ← Back
            </button>
            <button onClick={() => hasSelections && setStep(3)} disabled={!hasSelections}
              className="flex-1 py-3 text-xs tracking-widest uppercase transition-opacity"
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !hasSelections ? 0.5 : 1 }}>
              Review & Generate →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review + Generate ── */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Step 3 — Review & Generate</h2>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>
            Claude will analyse the room, then Replicate will add your items while keeping the room exactly as it is.
          </p>

          {/* Summary card */}
          <div className="p-5 border rounded-sm mb-6" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
            <div className="flex gap-4 mb-4">
              <div className="relative w-28 h-20 rounded-sm overflow-hidden shrink-0">
                <Image src={sourcePhoto} alt="Source" fill className="object-cover" unoptimized />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Items to add</p>
                <ul className="text-sm space-y-0.5" style={{ color: "#1A1A1A" }}>
                  {rug.enabled && <li>• {rug.size} {rug.style} rug{rug.color ? ` — ${rug.color}` : ""}</li>}
                  {furniture.items.map((i) => <li key={i}>• {i}{furniture.style ? ` (${furniture.style})` : ""}</li>)}
                  {lighting.items.map((i) => <li key={i}>• {i}{lighting.finish ? ` — ${lighting.finish}` : ""}</li>)}
                  {extraNotes.trim() && <li>• {extraNotes.trim()}</li>}
                </ul>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="text-xs underline" style={{ color: "#8B7355" }}>← Edit selections</button>
          </div>

          {error && (
            <div className="mb-4 p-4 border rounded-sm" style={{ borderColor: "#FFCDD2", backgroundColor: "#FFEBEE" }}>
              <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>
            </div>
          )}

          {generating && (
            <div className="mb-4 p-6 border rounded-sm text-center" style={{ borderColor: "#E0DCD6", backgroundColor: "#F0EDE8" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Generating your render...</p>
              <p className="text-xs" style={{ color: "#7A7A7A" }}>Claude is analysing the room → Replicate is adding your items. Takes 30–90 seconds.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} disabled={generating} className="flex-1 py-3 text-xs tracking-widest uppercase border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              ← Back
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="flex-1 py-3 text-xs tracking-widest uppercase transition-opacity"
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: generating ? 0.5 : 1 }}>
              {generating ? "Generating..." : "Generate Render"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
