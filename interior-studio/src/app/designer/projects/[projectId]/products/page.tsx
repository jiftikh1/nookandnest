"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
  id: string; name: string; supplier: string | null; price: number | null;
  currency: string; productUrl: string | null; imageUrl: string | null;
  category: string | null; notes: string | null; status: string;
}

const empty = { name: "", supplier: "", price: "", currency: "USD", productUrl: "", imageUrl: "", category: "", notes: "", status: "recommended" };

export default function ProductsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); });
  }, [projectId]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const product = await res.json();
    setProducts((prev) => [product, ...prev]);
    setForm({ ...empty });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/projects/${projectId}/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const statusColors: Record<string, string> = {
    recommended: "#8B7355",
    ordered: "#4A7B5B",
    installed: "#7A7A7A",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
      </div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Products
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs tracking-widest uppercase px-5 py-2.5"
          style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-8 p-8 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <h2 className="text-sm tracking-widest uppercase mb-6" style={{ color: "#8B7355" }}>New Product</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { field: "name", label: "PRODUCT NAME", required: true },
              { field: "supplier", label: "SUPPLIER / BRAND" },
              { field: "price", label: "PRICE", type: "number" },
              { field: "category", label: "CATEGORY" },
              { field: "productUrl", label: "PRODUCT URL" },
              { field: "imageUrl", label: "IMAGE URL" },
            ].map(({ field, label, required, type }) => (
              <div key={field} className="space-y-1.5">
                <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>{label}</Label>
                <Input
                  type={type || "text"}
                  value={(form as Record<string, string>)[field]}
                  onChange={(e) => update(field, e.target.value)}
                  required={required}
                  style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label style={{ color: "#4A4A4A", fontSize: "0.7rem", letterSpacing: "0.08em" }}>NOTES</Label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-sm resize-none"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5", color: "#4A4A4A" }}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={saving}
              style={{ backgroundColor: "#8B7355", color: "#FFFFFF", border: "none" }}>
              {saving ? "Saving..." : "Add Product"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}
              style={{ color: "#7A7A7A" }}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? <p style={{ color: "#7A7A7A" }}>Loading...</p> : products.length === 0 ? (
        <div className="text-center py-24 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-sm overflow-hidden" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
              {product.imageUrl && (
                <div className="relative h-48">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{product.name}</p>
                    {product.supplier && <p className="text-xs mt-0.5" style={{ color: "#7A7A7A" }}>{product.supplier}</p>}
                  </div>
                  <span className="text-xs tracking-widest uppercase ml-2 shrink-0"
                    style={{ color: statusColors[product.status] || "#7A7A7A" }}>
                    {product.status}
                  </span>
                </div>
                {product.price && (
                  <p className="text-sm font-light mb-2" style={{ color: "#4A4A4A" }}>
                    ${product.price.toLocaleString()} {product.currency}
                  </p>
                )}
                {product.notes && <p className="text-xs mb-3" style={{ color: "#7A7A7A" }}>{product.notes}</p>}
                <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "#E0DCD6" }}>
                  {product.productUrl && (
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
                      View →
                    </a>
                  )}
                  <button onClick={() => handleDelete(product.id)}
                    className="text-xs tracking-widest uppercase ml-auto" style={{ color: "#7A7A7A" }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
