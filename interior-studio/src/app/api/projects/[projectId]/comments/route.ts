import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const MAX_COMMENT_LENGTH = 5000;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return false;
}

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

    if (user.role === "CLIENT") {
      const project = await prisma.project.findFirst({ where: { id: projectId, clientId: user.id } });
      if (!project) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { projectId },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error("[comments GET]", err instanceof Error ? err.message : err);
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

    if (body.content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json({ error: "Comment too long" }, { status: 400 });
    }

    if (isRateLimited(user.id)) {
      return NextResponse.json({ error: "Too many comments — try again later" }, { status: 429 });
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
    console.error("[comments POST]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
