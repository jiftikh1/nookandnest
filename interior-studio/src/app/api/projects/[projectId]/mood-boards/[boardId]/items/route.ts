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

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string; boardId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { boardId } = await params;

    const body = await req.json();
    const { imageUrl, caption } = body;

    if (!isValidUrl(imageUrl)) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

    const count = await prisma.moodBoardItem.count({ where: { moodBoardId: boardId } });
    const item = await prisma.moodBoardItem.create({
      data: { imageUrl, caption, moodBoardId: boardId, order: count },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[mood-board items POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { boardId } = await params;
    const { itemId } = await req.json();

    await prisma.moodBoardItem.delete({ where: { id: itemId, moodBoardId: boardId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[mood-board items DELETE]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
