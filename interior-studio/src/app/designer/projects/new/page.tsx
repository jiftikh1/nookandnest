"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    clientName: "",
    clientEmail: "",
    revisionsPerSpace: "2",
    contractValue: "",
    currency: "USD",
    targetDate: "",
  });
  const [spaces, setSpaces] = useState<string[]>([""]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        spaces: spaces.map((s) => s.trim()).filter(Boolean),
        contractedSpaces: spaces.filter((s) => s.trim()).length || null,
        targetDate: form.targetDate || null,
      }),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/designer/projects/${project.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <Link href="/designer/dashboard" className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Dashboard
        </Link>
        <h1 className="text-4xl font-light mt-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          New Project
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-8 border rounded-sm space-y-5" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase" style={{ color: "#8B7355" }}>Project Details</h2>

          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>PROJECT NAME</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Chen Residence — Living Room"
              required
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>DESCRIPTION</Label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief description of the project scope..."
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-sm resize-none outline-none focus:ring-1"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5", color: "#4A4A4A" }}
            />
          </div>
        </div>

        <div className="p-8 border rounded-sm space-y-5" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase" style={{ color: "#8B7355" }}>Client Details</h2>

          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>CLIENT NAME</Label>
            <Input
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              placeholder="e.g. Sarah Chen"
              required
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>CLIENT EMAIL</Label>
            <Input
              type="email"
              value={form.clientEmail}
              onChange={(e) => update("clientEmail", e.target.value)}
              placeholder="client@email.com"
              required
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
            />
          </div>
        </div>

        <div className="p-8 border rounded-sm space-y-5" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <div>
            <h2 className="text-sm tracking-widest uppercase" style={{ color: "#8B7355" }}>Spaces</h2>
            <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>The spaces in scope for this contract. You can add more later.</p>
          </div>
          <div className="space-y-2">
            {spaces.map((space, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={space}
                  onChange={(e) => setSpaces((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))}
                  placeholder={i === 0 ? "e.g. Living Room" : "Another space"}
                  style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
                />
                {spaces.length > 1 && (
                  <button type="button" onClick={() => setSpaces((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs tracking-widest uppercase px-3" style={{ color: "#7A7A7A" }}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSpaces((prev) => [...prev, ""])}
            className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
            + Add Space
          </button>
        </div>

        <div className="p-8 border rounded-sm space-y-5" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase" style={{ color: "#8B7355" }}>Contract</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>REVISIONS PER SPACE</Label>
              <Input type="number" min={0} value={form.revisionsPerSpace} onChange={(e) => update("revisionsPerSpace", e.target.value)} style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>TARGET COMPLETION</Label>
              <Input type="date" value={form.targetDate} onChange={(e) => update("targetDate", e.target.value)} style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>CONTRACT VALUE (OPTIONAL)</Label>
              <Input type="number" min={0} step="0.01" value={form.contractValue} onChange={(e) => update("contractValue", e.target.value)} placeholder="0.00" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>CURRENCY</Label>
              <Input value={form.currency} maxLength={3} onChange={(e) => update("currency", e.target.value)} placeholder="USD" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }} />
            </div>
          </div>
          <p className="text-xs" style={{ color: "#7A7A7A" }}>Payment milestones can be added from the project&apos;s Contract page.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="tracking-widest text-xs uppercase"
            style={{ backgroundColor: "#8B7355", color: "#FFFFFF", border: "none", height: "44px", padding: "0 2rem" }}
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
          <Link
            href="/designer/dashboard"
            className="flex items-center text-xs tracking-widest uppercase px-8"
            style={{ color: "#7A7A7A" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
