import type { SpaceStatus } from "@prisma/client";

export const SPACE_STATUSES: SpaceStatus[] = ["NOT_STARTED", "IN_DESIGN", "IN_REVIEW", "CHANGES_REQUESTED", "COMPLETED"];

export const SPACE_STATUS_META: Record<SpaceStatus, { label: string; bg: string; text: string }> = {
  NOT_STARTED:       { label: "Not started",       bg: "#F0EDE8", text: "#7A7A7A" },
  IN_DESIGN:         { label: "In design",         bg: "#FFF8E7", text: "#B8860B" },
  IN_REVIEW:         { label: "In review",         bg: "#E3F2FD", text: "#1565C0" },
  CHANGES_REQUESTED: { label: "Changes requested", bg: "#FFEBEE", text: "#C62828" },
  COMPLETED:         { label: "Completed",         bg: "#E8F5E9", text: "#4A7B5B" },
};

// A revision is counted each time the client sends a round back for changes.
export function revisionsUsed(rounds: { status: string }[]) {
  return rounds.filter((r) => r.status === "CHANGES_REQUESTED").length;
}

export function revisionsAllowed(room: { revisionsIncluded: number | null }, project: { revisionsPerSpace: number }) {
  return room.revisionsIncluded ?? project.revisionsPerSpace;
}

export function isOverdue(room: { targetDate: Date | string | null; status: SpaceStatus }) {
  // Overdue only once the whole target day has passed
  return !!room.targetDate && room.status !== "COMPLETED" && new Date(room.targetDate).getTime() + 86_400_000 < Date.now();
}

// Spaces completed vs spaces in scope (contracted count, or the spaces added if larger/unset).
export function projectProgress(project: { contractedSpaces: number | null }, rooms: { status: SpaceStatus }[]) {
  const completed = rooms.filter((r) => r.status === "COMPLETED").length;
  const total = Math.max(project.contractedSpaces ?? 0, rooms.length);
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

// Target/due dates are stored as UTC midnight; format in UTC so they don't shift a day in local time.
export function formatDateOnly(d: Date | string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(d).toLocaleDateString(undefined, { ...opts, timeZone: "UTC" });
}
