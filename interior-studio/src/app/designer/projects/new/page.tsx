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
  });

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
      body: JSON.stringify(form),
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
