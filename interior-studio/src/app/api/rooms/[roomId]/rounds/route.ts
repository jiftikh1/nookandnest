import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notifyRoundSent } from "@/lib/email";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

// Designer sends a design round to the client for review.
export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const body = await req.json();

    const room = await prisma.room.findFirst({
      where: { id: roomId, project: { designerId } },
      select: { id: true, status: true, photoUrls: true, rounds: { select: { number: true, status: true } } },
    });
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (room.status === "COMPLETED") return NextResponse.json({ error: "Space is completed — reopen it first" }, { status: 400 });
    if (room.rounds.some((r) => r.status === "PENDING")) {
      return NextResponse.json({ error: "A round is already waiting for the client" }, { status: 400 });
    }

    const requestedRenderIds: string[] = Array.isArray(body.renderIds) ? body.renderIds : [];
    const requestedPhotos: string[] = Array.isArray(body.photoUrls) ? body.photoUrls : [];

    // Only accept finished renders from this room and photos that belong to it
    const renders = await prisma.roomRender.findMany({
      where: { id: { in: requestedRenderIds }, roomId, generatedImageUrl: { not: null } },
      select: { id: true },
    });
    const renderIds = renders.map((r) => r.id);
    const photoUrls = requestedPhotos.filter((u) => room.photoUrls.includes(u));

    if (renderIds.length === 0 && photoUrls.length === 0) {
      return NextResponse.json({ error: "Select at least one render or photo" }, { status: 400 });
    }

    const number = Math.max(0, ...room.rounds.map((r) => r.number)) + 1;
    const now = new Date();

    const [round] = await prisma.$transaction([
      prisma.designRound.create({
        data: { roomId, number, designerNote: body.designerNote?.trim() || null, renderIds, photoUrls },
      }),
      prisma.room.update({ where: { id: roomId }, data: { status: "IN_REVIEW", completedAt: null } }),
      // Renders sent for review become visible to the client
      prisma.roomRender.updateMany({
        where: { id: { in: renderIds }, isPublished: false },
        data: { isPublished: true, publishedAt: now, status: "PUBLISHED" },
      }),
    ]);

    after(() => notifyRoundSent(round.id));
    return NextResponse.json(round, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
