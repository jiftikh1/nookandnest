"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  projectId: string;
  roomId: string;
  photos: string[];
  primaryPhoto: string | null;
}

const BRUSH_SIZES = [12, 25, 45, 70];

export default function EditForm({ projectId, roomId, photos, primaryPhoto }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [sourcePhoto, setSourcePhoto] = useState(primaryPhoto ?? photos[0] ?? "");
  const [brushSize, setBrushSize] = useState(25);
  const [erasing, setErasing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [hasMask, setHasMask] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image to get natural dimensions and set canvas size
  useEffect(() => {
    if (!sourcePhoto || step !== 2) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Use natural dimensions, fallback to 1920×1080 if CORS/load gives 0
      const w = img.naturalWidth || 1920;
      const h = img.naturalHeight || 1080;
      canvas.width = w;
      canvas.height = h;
      setImgAspect(w / h);
      canvas.getContext("2d")!.clearRect(0, 0, w, h);
      setHasMask(false);
    };
    img.onerror = () => {
      // If image fails to load (CORS etc), use a standard canvas size
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 1920;
      canvas.height = 1080;
      setImgAspect(16 / 9);
    };
    img.src = sourcePhoto;
  }, [sourcePhoto, step]);

  const getScaledBrush = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return brushSize;
    const rect = canvas.getBoundingClientRect();
    return brushSize * (canvas.width / rect.width);
  }, [brushSize]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? 0;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function drawBrush(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const r = getScaledBrush() / 2;

    if (erasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
      ctx.fill();
      setHasMask(true);
    }
  }

  function onPointerDown(e: React.MouseEvent) {
    e.preventDefault();
    setIsDrawing(true);
    drawBrush(...Object.values(getPos(e)) as [number, number]);
  }
  function onPointerMove(e: React.MouseEvent) {
    if (!isDrawing) return;
    drawBrush(...Object.values(getPos(e)) as [number, number]);
  }
  function onPointerUp() { setIsDrawing(false); }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    drawBrush(x, y);
  }
  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    drawBrush(x, y);
  }
  function onTouchEnd() { setIsDrawing(false); }

  function clearMask() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  }

  function exportMask(): string {
    const canvas = canvasRef.current!;
    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const octx = offscreen.getContext("2d")!;

    // Black background (preserve by default)
    octx.fillStyle = "black";
    octx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Draw painted overlay
    octx.drawImage(canvas, 0, 0);

    // Convert: red pixels → white (inpaint), rest → black (keep)
    const imageData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const marked = d[i] > 50 && d[i + 3] > 30;
      d[i] = d[i + 1] = d[i + 2] = marked ? 255 : 0;
      d[i + 3] = 255;
    }
    octx.putImageData(imageData, 0, 0);
    return offscreen.toDataURL("image/png");
  }

  async function handleEdit() {
    if (!hasMask) { setError("Paint over the items you want to remove first."); return; }
    setGenerating(true);
    setError(null);

    try {
      const maskDataUrl = exportMask();

      const renderRes = await fetch(`/api/rooms/${roomId}/renders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: "Photorealistic",
          designNotes: prompt || "Remove selected items",
          sourcePhotoUrl: sourcePhoto,
        }),
      });

      if (!renderRes.ok) { setError("Failed to create render."); setGenerating(false); return; }
      const render = await renderRes.json();

      const editRes = await fetch(`/api/renders/${render.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maskDataUrl, prompt, sourcePhotoUrl: sourcePhoto }),
      });

      if (editRes.ok) {
        router.push(`/designer/projects/${projectId}/rooms/${roomId}/renders`);
      } else {
        const data = await editRes.json();
        setError(data.error || "Edit failed. Try again.");
        setGenerating(false);
      }
    } catch {
      setError("Something went wrong.");
      setGenerating(false);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed rounded-sm text-center" style={{ borderColor: "#E0DCD6" }}>
        <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No room photos yet</p>
        <a href={`/designer/projects/${projectId}/rooms/${roomId}`} className="text-xs tracking-widest uppercase px-6 py-3" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          Add Photos →
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* ── Step 1: Pick photo ── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            Step 1 — Pick a Photo to Edit
          </h2>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>
            You{"'"}ll paint over the items you want to remove or replace.
          </p>
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
            Continue to Edit Canvas →
          </button>
        </div>
      )}

      {/* ── Step 2: Canvas editor ── */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            Step 2 — Paint to Remove
          </h2>
          <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>
            Brush over anything you want removed. Flux Fill will reveal the floor and walls behind it.
          </p>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-3 p-3 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
            {/* Paint / Erase toggle */}
            <div className="flex gap-1">
              <button onClick={() => setErasing(false)}
                className="px-3 py-1.5 text-xs tracking-widest uppercase rounded-sm transition-colors"
                style={{ backgroundColor: !erasing ? "#8B7355" : "transparent", color: !erasing ? "#FFFFFF" : "#7A7A7A", border: "1px solid", borderColor: !erasing ? "#8B7355" : "#E0DCD6" }}>
                Paint
              </button>
              <button onClick={() => setErasing(true)}
                className="px-3 py-1.5 text-xs tracking-widest uppercase rounded-sm transition-colors"
                style={{ backgroundColor: erasing ? "#8B7355" : "transparent", color: erasing ? "#FFFFFF" : "#7A7A7A", border: "1px solid", borderColor: erasing ? "#8B7355" : "#E0DCD6" }}>
                Erase
              </button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#7A7A7A" }}>Size</span>
              {BRUSH_SIZES.map((s) => (
                <button key={s} onClick={() => setBrushSize(s)}
                  className="rounded-full flex items-center justify-center transition-colors border"
                  style={{
                    width: 28, height: 28,
                    borderColor: brushSize === s ? "#8B7355" : "#E0DCD6",
                    backgroundColor: brushSize === s ? "#F0EDE8" : "transparent",
                  }}>
                  <span className="rounded-full" style={{
                    width: Math.max(6, s / 5), height: Math.max(6, s / 5),
                    backgroundColor: brushSize === s ? "#8B7355" : "#AAAAAA",
                    display: "block",
                  }} />
                </button>
              ))}
            </div>

            {/* Clear */}
            <button onClick={clearMask} className="ml-auto text-xs px-3 py-1.5 border rounded-sm" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              Clear All
            </button>
          </div>

          {/* Canvas */}
          <div className="relative rounded-sm overflow-hidden border mb-4"
            style={{
              borderColor: "#E0DCD6",
              aspectRatio: imgAspect ? `${imgAspect}` : "16/9",
              cursor: erasing ? "cell" : "crosshair",
            }}>
            {/* Photo background */}
            <img
              src={sourcePhoto}
              alt="Room"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ pointerEvents: "none", userSelect: "none" }}
            />
            {/* Drawing canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: "none" }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
            {/* Hint overlay */}
            {!hasMask && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-sm text-xs" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#FFFFFF" }}>
                  Paint over items to remove
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-5 text-xs" style={{ color: "#7A7A7A" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.6)" }} />
              Painted area will be removed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border" style={{ borderColor: "#CCC" }} />
              Rest stays unchanged
            </span>
          </div>

          {/* Optional prompt */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7A7A7A" }}>
              What to put in its place? <span className="normal-case font-normal">(optional — leave blank to just reveal the room)</span>
            </p>
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. a potted palm tree, replace with a modern armchair in grey..."
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }} />
          </div>

          {error && (
            <div className="mb-4 p-4 border rounded-sm" style={{ borderColor: "#FFCDD2", backgroundColor: "#FFEBEE" }}>
              <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>
            </div>
          )}

          {generating && (
            <div className="mb-4 p-5 border rounded-sm text-center" style={{ borderColor: "#E0DCD6", backgroundColor: "#F0EDE8" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "#1A1A1A" }}>Editing your photo...</p>
              <p className="text-xs" style={{ color: "#7A7A7A" }}>Flux Fill is removing the selected items. This takes 15–30 seconds.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} disabled={generating}
              className="flex-1 py-3 text-xs tracking-widest uppercase border"
              style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              ← Back
            </button>
            <button onClick={handleEdit} disabled={generating || !hasMask}
              className="flex-1 py-3 text-xs tracking-widest uppercase transition-opacity"
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: (generating || !hasMask) ? 0.5 : 1 }}>
              {generating ? "Removing..." : "Apply Edit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
