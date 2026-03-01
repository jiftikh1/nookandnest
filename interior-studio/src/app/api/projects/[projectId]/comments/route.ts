import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, name: true, role: true } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;

    const comments = await prisma.comment.findMany({
      where: { projectId },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;
    const body = await req.json();

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content.trim(),
        userId: user.id,
        projectId,
        roomId: body.roomId ?? null,
      },
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
