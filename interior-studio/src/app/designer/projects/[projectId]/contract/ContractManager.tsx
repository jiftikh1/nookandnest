"use client";

import { useState } from "react";
import type { MilestoneStatus } from "@prisma/client";
import { MILESTONE_STATUSES, MILESTONE_STATUS_META, formatMoney } from "@/lib/contract";

interface Terms {
  contractedSpaces: string;
  revisionsPerSpace: string;
  contractValue: string;
  currency: string;
  targetDate: string;
}

interface Milestone {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  paidAt: string | null;
  roomId: string | null;
}

interface Props {
  projectId: string;
  spaces: { id: string; name: string }[];
  initialTerms: Terms;
  initialMilestones: Milestone[];
}

const inputClass = "w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]";
const inputStyle = { borderColor: "#E0DCD6", color: "#1A1A1A", backgroundColor: "#FFFFFF" };
const emptyForm = { label: "", amount: "", dueDate: "", roomId: "" };

const toMilestone = (m: Milestone & { dueDate: string | null }): Milestone => ({ ...m, dueDate: m.dueDate?.slice(0, 10) ?? "" });

export default function ContractManager({ projectId, spaces, initialTerms, initialMilestones }: Props) {
  const [terms, setTerms] = useState(initialTerms);
  const [savedTerms, setSavedTerms] = useState(initialTerms);
  const [savingTerms, setSavingTerms] = useState(false);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const termsDirty = JSON.stringify(terms) !== JSON.stringify(savedTerms);
  const currency = savedTerms.currency || "USD";
  const contractValue = savedTerms.contractValue ? Number(savedTerms.contractValue) : null;
  const scheduled = milestones.reduce((sum, m) => sum + m.amount, 0);
  const paid = milestones.filter((m) => m.status === "PAID").reduce((sum, m) => sum + m.amount, 0);
  const spaceName = new Map(spaces.map((s) => [s.id, s.name]));

  async function saveTerms() {
    setSavingTerms(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(terms),
    });
    if (res.ok) {
      const normalized = { ...terms, currency: terms.currency.trim().toUpperCase() || "USD" };
      setTerms(normalized);
      setSavedTerms(normalized);
    } else {
      setError((await res.json()).error || "Failed to save terms");
    }
    setSavingTerms(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(m: Milestone) {
    setForm({ label: m.label, amount: m.amount.toString(), dueDate: m.dueDate, roomId: m.roomId ?? "" });
    setEditingId(m.id);
    setShowForm(true);
  }

  async function saveMilestone() {
    setError(null);
    const url = editingId ? `/api/projects/${projectId}/milestones/${editingId}` : `/api/projects/${projectId}/milestones`;
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || null, roomId: form.roomId || null }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed to save milestone");
      return;
    }
    const saved = toMilestone(await res.json());
    setMilestones((prev) => editingId ? prev.map((m) => m.id === editingId ? saved : m) : [...prev, saved]);
    resetForm();
  }

  async function setStatus(m: Milestone, status: MilestoneStatus) {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/milestones/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed to update status");
      return;
    }
    const saved = toMilestone(await res.json());
    setMilestones((prev) => prev.map((x) => x.id === m.id ? saved : x));
  }

  async function deleteMilestone(id: string) {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/milestones/${id}`, { method: "DELETE" });
    if (res.ok) setMilestones((prev) => prev.filter((m) => m.id !== id));
    else setError((await res.json()).error || "Failed to delete");
    setConfirmDeleteId(null);
  }

  const termField = (key: keyof Terms, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>{label}</label>
      <input value={terms[key]} onChange={(e) => setTerms((t) => ({ ...t, [key]: e.target.value }))}
        className={inputClass} style={inputStyle} {...props} />
    </div>
  );

  return (
    <div className="space-y-10">
      {error && <p className="text-sm" style={{ color: "#C62828" }}>{error}</p>}

      {/* Terms */}
      <section className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
        <h2 className="text-lg font-light mb-5" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Terms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {termField("contractedSpaces", "Spaces in scope", { type: "number", min: 0, placeholder: `${spaces.length} (spaces added)` })}
          {termField("revisionsPerSpace", "Revisions per space", { type: "number", min: 0 })}
          {termField("targetDate", "Target completion", { type: "date" })}
          {termField("contractValue", "Contract value", { type: "number", min: 0, step: "0.01", placeholder: "0.00" })}
          {termField("currency", "Currency", { maxLength: 3, placeholder: "USD" })}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={saveTerms} disabled={!termsDirty || savingTerms}
            className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !termsDirty || savingTerms ? 0.5 : 1 }}>
            {savingTerms ? "Saving..." : "Save Terms"}
          </button>
          {!termsDirty && <span className="text-xs" style={{ color: "#7A7A7A" }}>Saved</span>}
        </div>
      </section>

      {/* Payment milestones */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>Payment milestones</h2>
            <p className="text-sm mt-1" style={{ color: "#7A7A7A" }}>
              {formatMoney(paid, currency)} paid of {formatMoney(scheduled, currency)} scheduled
              {contractValue !== null && ` · contract ${formatMoney(contractValue, currency)}`}
            </p>
            {contractValue !== null && Math.abs(scheduled - contractValue) > 0.005 && milestones.length > 0 && (
              <p className="text-xs mt-1" style={{ color: "#B8860B" }}>
                Milestones {scheduled > contractValue ? "exceed" : "don't add up to"} the contract value
                ({formatMoney(Math.abs(scheduled - contractValue), currency)} {scheduled > contractValue ? "over" : "unscheduled"}).
              </p>
            )}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="text-xs tracking-widest uppercase px-5 py-2.5 border"
              style={{ borderColor: "#8B7355", color: "#8B7355" }}>
              + Add Milestone
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6 p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Label *</label>
                <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Kickoff deposit (30%)" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Amount ({currency}) *</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Due date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className={inputClass} style={inputStyle} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Linked space</label>
                <select value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                  className={inputClass} style={inputStyle}>
                  <option value="">Whole project</option>
                  {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={resetForm} className="text-xs tracking-widest uppercase px-5 py-2.5 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
                Cancel
              </button>
              <button onClick={saveMilestone} disabled={!form.label.trim() || form.amount === ""}
                className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity"
                style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !form.label.trim() || form.amount === "" ? 0.5 : 1 }}>
                {editingId ? "Save Changes" : "Add Milestone"}
              </button>
            </div>
          </div>
        )}

        {milestones.length === 0 && !showForm ? (
          <div className="text-center py-14 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
            <p className="text-sm" style={{ color: "#7A7A7A" }}>No payment milestones yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>
                  <th className="px-4 py-3 font-normal">Milestone</th>
                  <th className="px-4 py-3 font-normal text-right">Amount</th>
                  <th className="px-4 py-3 font-normal">Due</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => {
                  const meta = MILESTONE_STATUS_META[m.status];
                  return (
                    <tr key={m.id} className="border-t" style={{ borderColor: "#F0EDE8" }}>
                      <td className="px-4 py-3">
                        <p style={{ color: "#1A1A1A" }}>{m.label}</p>
                        {m.roomId && <p className="text-xs" style={{ color: "#7A7A7A" }}>{spaceName.get(m.roomId)}</p>}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" style={{ color: "#1A1A1A" }}>{formatMoney(m.amount, currency)}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "#4A4A4A" }}>
                        {m.dueDate ? new Date(`${m.dueDate}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select value={m.status} onChange={(e) => setStatus(m, e.target.value as MilestoneStatus)}
                          className="text-xs tracking-widest uppercase px-2 py-1 rounded-full border-0 cursor-pointer"
                          style={{ backgroundColor: meta.bg, color: meta.text }}>
                          {MILESTONE_STATUSES.map((s) => <option key={s} value={s}>{MILESTONE_STATUS_META[s].label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {confirmDeleteId === m.id ? (
                          <span className="inline-flex gap-2">
                            <button onClick={() => deleteMilestone(m.id)} className="text-xs tracking-widest uppercase" style={{ color: "#C62828" }}>Delete</button>
                            <button onClick={() => setConfirmDeleteId(null)} className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>Keep</button>
                          </span>
                        ) : (
                          <span className="inline-flex gap-3">
                            <button onClick={() => startEdit(m)} className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>Edit</button>
                            <button onClick={() => setConfirmDeleteId(m.id)} className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>Remove</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
