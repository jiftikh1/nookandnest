import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

function isValidUrl(url: unknown): boolean {
  if (!url || typeof url !== "string") return true;
  try { return ["http:", "https:"].includes(new URL(url).protocol); }
  catch { return false; }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; boardId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { boardId } = await params;
    const body = await req.json();

    if (!isValidUrl(body.imageUrl)) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

    const count = await prisma.moodBoardItem.count({ where: { moodBoardId: boardId } });
    const item = await prisma.moodBoardItem.create({
      data: {
        imageUrl: body.imageUrl,
        caption: body.caption,
        order: count,
        moodBoardId: boardId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[room mood-board items POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; boardId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { boardId } = await params;
    const body = await req.json();

    // Reorder items: body.order = [{ id, order }]
    if (body.order) {
      await prisma.$transaction(
        body.order.map(({ id, order }: { id: string; order: number }) =>
          prisma.moodBoardItem.update({ where: { id }, data: { order } })
        )
      );
      const items = await prisma.moodBoardItem.findMany({
        where: { moodBoardId: boardId },
        orderBy: { order: "asc" },
      });
      return NextResponse.json(items);
    }

    // Update single item
    if (body.id) {
      const item = await prisma.moodBoardItem.update({
        where: { id: body.id },
        data: { caption: body.caption },
      });
      return NextResponse.json(item);
    }

    return NextResponse.json({ error: "No operation specified" }, { status: 400 });
  } catch (err) {
    console.error("[room mood-board items]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; boardId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const itemId = new URL(req.url).searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

    await prisma.moodBoardItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[room mood-board items]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
