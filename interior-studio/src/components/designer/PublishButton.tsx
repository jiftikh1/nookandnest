"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishButton({ renderId }: { renderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePublish() {
    setLoading(true);
    await fetch(`/api/renders/${renderId}/publish`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handlePublish}
      disabled={loading}
      className="text-xs tracking-widest uppercase"
      style={{ color: "#8B7355" }}
    >
      {loading ? "Publishing..." : "Publish to Client →"}
    </button>
  );
}
