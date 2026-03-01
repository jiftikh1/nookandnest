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

async function verifyRoom(roomId: string, designerId: string) {
  return prisma.room.findFirst({
    where: { id: roomId, project: { designerId } },
    select: { id: true },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const room = await verifyRoom(roomId, designerId);
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const boards = await prisma.moodBoard.findMany({
      where: { roomId },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(boards);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const room = await verifyRoom(roomId, designerId);
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const count = await prisma.moodBoard.count({ where: { roomId } });
    const board = await prisma.moodBoard.create({
      data: { title: body.title || "New Board", description: body.description, roomId, order: count },
      include: { items: true },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
