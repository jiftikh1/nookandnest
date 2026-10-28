"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { SpaceStatus, RoundStatus } from "@prisma/client";
import SpaceStatusBadge from "@/components/designer/SpaceStatusBadge";
import { revisionsUsed } from "@/lib/spaces";

interface Round {
  id: string;
  number: number;
  designerNote: string | null;
  renderIds: string[];
  photoUrls: string[];
  status: RoundStatus;
  clientFeedback: string | null;
  sentAt: string;
  respondedAt: string | null;
}

interface Props {
  roomId: string;
  initialStatus: SpaceStatus;
  initialTargetDate: string;
  initialRevisionsIncluded: number | null;
  projectRevisionsPerSpace: number;
  renders: { id: string; imageUrl: string; style: string | null }[];
  photoUrls: string[];
  rounds: Round[];
}

const ROUND_META: Record<RoundStatus, { label: string; color: string }> = {
  PENDING:           { label: "Waiting for client", color: "#1565C0" },
  APPROVED:          { label: "Approved",           color: "#4A7B5B" },
  CHANGES_REQUESTED: { label: "Changes requested",  color: "#C62828" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewManager(props: Props) {
  const { roomId, renders, photoUrls, rounds, projectRevisionsPerSpace } = props;
  const router = useRouter();
  const [status, setStatus] = useState(props.initialStatus);
  const [targetDate, setTargetDate] = useState(props.initialTargetDate);
  const [revisionsIncluded, setRevisionsIncluded] = useState(props.initialRevisionsIncluded?.toString() ?? "");
  const [selectedRenders, setSelectedRenders] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const used = revisionsUsed(rounds);
  const allowed = revisionsIncluded === "" ? projectRevisionsPerSpace : Number(revisionsIncluded);
  const hasPending = rounds.some((r) => r.status === "PENDING");
  const renderById = new Map(renders.map((r) => [r.id, r]));

  async function patchRoom(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed to save");
      return null;
    }
    return res.json();
  }

  async function changeStatus(next: SpaceStatus) {
    setBusy(true);
    const updated = await patchRoom({ status: next });
    if (updated) setStatus(updated.status);
    setConfirmComplete(false);
    setBusy(false);
    router.refresh();
  }

  async function sendRound() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ renderIds: selectedRenders, photoUrls: selectedPhotos, designerNote: note }),
    });
    if (res.ok) {
      setSelectedRenders([]);
      setSelectedPhotos([]);
      setNote("");
      setStatus("IN_REVIEW");
      router.refresh();
    } else {
      setError((await res.json()).error || "Failed to send");
    }
    setBusy(false);
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const nothingSelected = selectedRenders.length === 0 && selectedPhotos.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left: send round + history */}
      <div className="lg:col-span-2 space-y-10">
        {error && <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>}

        {/* Send for review */}
        <section className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-lg font-light mb-1" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            Send round {rounds.length + 1} for review
          </h2>
          {status === "COMPLETED" ? (
            <p className="text-sm" style={{ color: "#7A7A7A" }}>This space is completed. Reopen it to send another round.</p>
          ) : hasPending ? (
            <p className="text-sm" style={{ color: "#7A7A7A" }}>Round {rounds[0].number} is waiting for the client&apos;s response.</p>
          ) : renders.length === 0 && photoUrls.length === 0 ? (
            <p className="text-sm" style={{ color: "#7A7A7A" }}>Add photos or generate renders for this space first.</p>
          ) : (
            <>
              <p className="text-sm mb-5" style={{ color: "#7A7A7A" }}>Pick what the client should review. Selected renders become visible to the client.</p>

              {renders.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>Renders</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {renders.map((r) => (
                      <SelectableImage key={r.id} url={r.imageUrl} selected={selectedRenders.includes(r.id)}
                        onClick={() => toggle(selectedRenders, setSelectedRenders, r.id)} />
                    ))}
                  </div>
                </div>
              )}

              {photoUrls.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>Photos</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {photoUrls.map((url) => (
                      <SelectableImage key={url} url={url} selected={selectedPhotos.includes(url)}
                        onClick={() => toggle(selectedPhotos, setSelectedPhotos, url)} />
                    ))}
                  </div>
                </div>
              )}

              <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Note to client</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What changed in this round, what you'd like feedback on..."
                className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-none mb-4"
                style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
              />
              <button
                onClick={sendRound}
                disabled={busy || nothingSelected}
                className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity"
                style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: busy || nothingSelected ? 0.5 : 1 }}
              >
                {busy ? "Sending..." : "Send for Review"}
              </button>
            </>
          )}
        </section>

        {/* Round history */}
        <section>
          <h2 className="text-lg font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Round history</h2>
          {rounds.length === 0 ? (
            <p className="text-sm" style={{ color: "#7A7A7A" }}>No rounds sent yet.</p>
          ) : (
            <div className="space-y-4">
              {rounds.map((round) => {
                const meta = ROUND_META[round.status];
                const images = [
                  ...round.renderIds.map((id) => renderById.get(id)?.imageUrl).filter((u): u is string => !!u),
                  ...round.photoUrls,
                ];
                return (
                  <div key={round.id} className="p-5 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                        Round {round.number}
                        <span className="font-normal ml-2" style={{ color: "#7A7A7A" }}>sent {formatDate(round.sentAt)}</span>
                      </p>
                      <span className="text-xs tracking-widest uppercase" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    {images.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {images.map((url) => (
                          <div key={url} className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                            <Image src={url} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>
                    )}
                    {round.designerNote && <p className="text-sm mb-2" style={{ color: "#4A4A4A" }}>{round.designerNote}</p>}
                    {round.clientFeedback && (
                      <div className="p-3 border-l-2 mt-2" style={{ borderColor: meta.color, backgroundColor: "#FBF9F7" }}>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>
                          Client feedback{round.respondedAt && ` · ${formatDate(round.respondedAt)}`}
                        </p>
                        <p className="text-sm" style={{ color: "#1A1A1A" }}>{round.clientFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Right: status + contract settings */}
      <aside className="space-y-6">
        <div className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>Status</p>
          <div className="mb-5"><SpaceStatusBadge status={status} /></div>

          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Revisions</p>
          <p className="text-2xl font-light mb-5" style={{ fontFamily: "var(--font-serif)", color: used > allowed ? "#C62828" : "#1A1A1A" }}>
            {used} <span className="text-base" style={{ color: "#7A7A7A" }}>of {allowed} used</span>
          </p>

          {status === "NOT_STARTED" && (
            <button onClick={() => changeStatus("IN_DESIGN")} disabled={busy}
              className="w-full text-xs tracking-widest uppercase px-4 py-2.5" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
              Start Design
            </button>
          )}
          {status !== "COMPLETED" && status !== "NOT_STARTED" && (
            confirmComplete ? (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: "#4A4A4A" }}>
                  {hasPending ? "The client hasn't responded to the latest round yet. " : ""}Mark this space completed without client approval?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => changeStatus("COMPLETED")} disabled={busy}
                    className="flex-1 text-xs tracking-widest uppercase px-3 py-2" style={{ backgroundColor: "#4A7B5B", color: "#FFFFFF" }}>
                    Yes, complete
                  </button>
                  <button onClick={() => setConfirmComplete(false)}
                    className="flex-1 text-xs tracking-widest uppercase px-3 py-2 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmComplete(true)}
                className="w-full text-xs tracking-widest uppercase px-4 py-2.5 border" style={{ borderColor: "#4A7B5B", color: "#4A7B5B" }}>
                Mark Completed
              </button>
            )
          )}
          {status === "COMPLETED" && (
            <button onClick={() => changeStatus("IN_DESIGN")} disabled={busy}
              className="w-full text-xs tracking-widest uppercase px-4 py-2.5 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              Reopen Space
            </button>
          )}
        </div>

        <div className="p-6 border rounded-sm space-y-4" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              onBlur={() => patchRoom({ targetDate: targetDate || null })}
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Revisions included</label>
            <input
              type="number"
              min={0}
              value={revisionsIncluded}
              placeholder={`${projectRevisionsPerSpace} (project default)`}
              onChange={(e) => setRevisionsIncluded(e.target.value)}
              onBlur={() => patchRoom({ revisionsIncluded: revisionsIncluded === "" ? null : Number(revisionsIncluded) })}
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function SelectableImage({ url, selected, onClick }: { url: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="relative aspect-square rounded-sm overflow-hidden border-2 transition-colors"
      style={{ borderColor: selected ? "#8B7355" : "#E0DCD6" }}>
      <Image src={url} alt="" fill className="object-cover" unoptimized />
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>✓</span>
      )}
    </button>
  );
}
