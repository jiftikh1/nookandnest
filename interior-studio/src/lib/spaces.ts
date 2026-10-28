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
  return !!room.targetDate && room.status !== "COMPLETED" && new Date(room.targetDate) < new Date();
}
