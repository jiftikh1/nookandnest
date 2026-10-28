import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SPACE_STATUSES } from "@/lib/spaces";
import type { SpaceStatus } from "@prisma/client";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const body = await req.json();

    // Verify this room belongs to the designer
    const room = await prisma.room.findFirst({
      where: { id: roomId, project: { designerId } },
      select: { id: true, photoUrls: true, originalPhotoUrl: true },
    });
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: {
      name?: string;
      photoUrls?: string[];
      originalPhotoUrl?: string | null;
      status?: SpaceStatus;
      completedAt?: Date | null;
      targetDate?: Date | null;
      revisionsIncluded?: number | null;
    } = {};

    if (body.name !== undefined) updateData.name = body.name;

    // Designer status override (e.g. start design, mark completed, reopen)
    if (body.status !== undefined) {
      if (!SPACE_STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      updateData.status = body.status;
      updateData.completedAt = body.status === "COMPLETED" ? new Date() : null;
    }

    if (body.targetDate !== undefined) updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;

    if (body.revisionsIncluded !== undefined) {
      const n = body.revisionsIncluded === null || body.revisionsIncluded === "" ? null : Number(body.revisionsIncluded);
      if (n !== null && (!Number.isInteger(n) || n < 0)) return NextResponse.json({ error: "Invalid revisions" }, { status: 400 });
      updateData.revisionsIncluded = n;
    }

    // Add a photo
    if (body.addPhoto) {
      const newUrls = [...room.photoUrls, body.addPhoto];
      updateData.photoUrls = newUrls;
      // First photo becomes the primary
      if (!room.originalPhotoUrl) updateData.originalPhotoUrl = body.addPhoto;
    }

    // Remove a photo
    if (body.removePhoto) {
      const newUrls = room.photoUrls.filter((u) => u !== body.removePhoto);
      updateData.photoUrls = newUrls;
      // If we removed the primary, set the next one as primary
      if (room.originalPhotoUrl === body.removePhoto) {
        updateData.originalPhotoUrl = newUrls[0] ?? null;
      }
    }

    // Set primary photo
    if (body.setPrimary) {
      updateData.originalPhotoUrl = body.setPrimary;
    }

    const updated = await prisma.room.update({ where: { id: roomId }, data: updateData });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
