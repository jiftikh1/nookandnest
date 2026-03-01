"use client";

import { useState } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  supplier: string | null;
  price: number | null;
  currency: string;
  productUrl: string | null;
  imageUrl: string | null;
  category: string | null;
  notes: string | null;
  isVisible: boolean;
}

interface Props {
  roomId: string;
  initialProducts: Product[];
}

const CATEGORIES = ["Furniture", "Lighting", "Textiles", "Flooring", "Art & Decor", "Hardware", "Paint", "Other"];

export default function ItemsManager({ roomId, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", supplier: "", price: "", currency: "USD", productUrl: "", imageUrl: "", category: "", notes: "", isVisible: true,
  });

  function resetForm() {
    setForm({ name: "", supplier: "", price: "", currency: "USD", productUrl: "", imageUrl: "", category: "", notes: "", isVisible: true });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      supplier: product.supplier ?? "",
      price: product.price?.toString() ?? "",
      currency: product.currency,
      productUrl: product.productUrl ?? "",
      imageUrl: product.imageUrl ?? "",
      category: product.category ?? "",
      notes: product.notes ?? "",
      isVisible: product.isVisible,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function saveProduct() {
    const body = { ...form, price: form.price || undefined };
    if (editingId) {
      const res = await fetch(`/api/rooms/${roomId}/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => p.id === editingId ? updated : p));
    } else {
      const res = await fetch(`/api/rooms/${roomId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      setProducts((prev) => [created, ...prev]);
    }
    resetForm();
  }

  async function toggleVisibility(product: Product) {
    const res = await fetch(`/api/rooms/${roomId}/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !product.isVisible }),
    });
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => p.id === product.id ? updated : p));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/rooms/${roomId}/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: "#7A7A7A" }}>{products.length} item{products.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs tracking-widest uppercase px-5 py-2.5 border"
          style={{ borderColor: "#8B7355", color: "#8B7355" }}
        >
          + Add Item
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="mb-8 p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
          <h3 className="text-lg font-light mb-5" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            {editingId ? "Edit Item" : "Add Item"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name *", key: "name", placeholder: "e.g. Lounge Chair" },
              { label: "Brand / Supplier", key: "supplier", placeholder: "e.g. Muuto" },
              { label: "Price", key: "price", placeholder: "0.00", type: "number" },
              { label: "Currency", key: "currency", placeholder: "USD" },
              { label: "Buy Link", key: "productUrl", placeholder: "https://..." },
              { label: "Image URL", key: "imageUrl", placeholder: "https://..." },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>{label}</label>
                <input
                  type={type || "text"}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
                  style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355]"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Notes</label>
            <textarea
              placeholder="Any notes about this item..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full text-sm border px-3 py-2 rounded-sm focus:outline-none focus:border-[#8B7355] resize-none"
              style={{ borderColor: "#E0DCD6", color: "#1A1A1A" }}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
              />
              <span className="text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>Visible to client</span>
            </label>
          </div>

          <div className="mt-5 flex gap-3 justify-end">
            <button onClick={resetForm} className="text-xs tracking-widest uppercase px-5 py-2.5 border" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
              Cancel
            </button>
            <button onClick={saveProduct} disabled={!form.name.trim()} className="text-xs tracking-widest uppercase px-5 py-2.5 transition-opacity" style={{ backgroundColor: "#8B7355", color: "#FFFFFF", opacity: !form.name.trim() ? 0.5 : 1 }}>
              {editingId ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !showForm ? (
        <div className="text-center py-20 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
          <p className="text-lg font-light mb-2" style={{ fontFamily: "var(--font-serif)", color: "#4A4A4A" }}>No items yet</p>
          <p className="text-sm mb-6" style={{ color: "#7A7A7A" }}>Add product picks that will appear in the client view.</p>
          <button onClick={() => setShowForm(true)} className="text-xs tracking-widest uppercase px-6 py-3" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 border rounded-sm transition-opacity"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF", opacity: product.isVisible ? 1 : 0.6 }}
            >
              {product.imageUrl && (
                <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm mb-0.5" style={{ color: "#1A1A1A" }}>{product.name}</p>
                    {product.supplier && <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{product.supplier}</p>}
                    {product.price && (
                      <p className="text-sm font-medium" style={{ color: "#8B7355" }}>
                        {product.currency} {product.price.toFixed(2)}
                      </p>
                    )}
                    {product.category && (
                      <span className="text-xs tracking-widest uppercase px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: "#F0EDE8", color: "#8B7355" }}>
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleVisibility(product)}
                      className="text-xs tracking-widest uppercase px-3 py-1.5 border rounded-sm transition-colors"
                      style={{
                        borderColor: product.isVisible ? "#4A7B5B" : "#E0DCD6",
                        color: product.isVisible ? "#4A7B5B" : "#7A7A7A",
                      }}
                    >
                      {product.isVisible ? "Visible" : "Hidden"}
                    </button>
                    <button onClick={() => startEdit(product)} className="text-xs tracking-widest uppercase px-3 py-1.5 border rounded-sm" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
                      Edit
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-xs tracking-widest uppercase px-3 py-1.5 border rounded-sm hover:border-red-300 hover:text-red-500 transition-colors" style={{ borderColor: "#E0DCD6", color: "#7A7A7A" }}>
                      Delete
                    </button>
                  </div>
                </div>
                {product.notes && <p className="text-xs mt-2" style={{ color: "#7A7A7A" }}>{product.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
