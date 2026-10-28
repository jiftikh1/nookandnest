import type { SpaceStatus } from "@prisma/client";
import { SPACE_STATUS_META } from "@/lib/spaces";

export default function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  const meta = SPACE_STATUS_META[status];
  return (
    <span className="text-xs tracking-widest uppercase px-2 py-0.5 rounded-full inline-block whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.text }}>
      {meta.label}
    </span>
  );
}
