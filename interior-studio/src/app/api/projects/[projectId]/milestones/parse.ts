import { prisma } from "@/lib/prisma";
import { MILESTONE_STATUSES } from "@/lib/contract";
import type { MilestoneStatus } from "@prisma/client";

interface MilestoneFields {
  label?: string;
  amount?: number;
  dueDate?: Date | null;
  status?: MilestoneStatus;
  paidAt?: Date | null;
  roomId?: string | null;
}

// Picks and validates the milestone fields present in a request body.
export async function parseMilestoneFields(body: Record<string, unknown>, projectId: string): Promise<{ data: MilestoneFields; error?: string }> {
  const data: MilestoneFields = {};

  if (body.label !== undefined) {
    const label = String(body.label).trim();
    if (!label) return { data, error: "Label is required" };
    data.label = label;
  }

  if (body.amount !== undefined) {
    const n = Number(body.amount);
    if (body.amount === "" || body.amount === null || !Number.isFinite(n) || n < 0) return { data, error: "Amount must be a positive number" };
    data.amount = n;
  }

  if (body.dueDate !== undefined) {
    const d = body.dueDate ? new Date(String(body.dueDate)) : null;
    if (d && isNaN(d.getTime())) return { data, error: "Invalid due date" };
    data.dueDate = d;
  }

  if (body.status !== undefined) {
    if (!MILESTONE_STATUSES.includes(body.status as MilestoneStatus)) return { data, error: "Invalid status" };
    data.status = body.status as MilestoneStatus;
    data.paidAt = body.status === "PAID" ? new Date() : null;
  }

  if (body.roomId !== undefined) {
    if (!body.roomId) {
      data.roomId = null;
    } else {
      const room = await prisma.room.findFirst({ where: { id: String(body.roomId), projectId }, select: { id: true } });
      if (!room) return { data, error: "Space not found in this project" };
      data.roomId = room.id;
    }
  }

  return { data };
}
