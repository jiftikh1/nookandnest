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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ renderId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { renderId } = await params;

    const owned = await prisma.roomRender.findFirst({
      where: { id: renderId, room: { project: { designerId } } },
    });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const render = await prisma.roomRender.update({
      where: { id: renderId },
      data: { isPublished: true, publishedAt: new Date(), status: "PUBLISHED" },
    });

    return NextResponse.json(render);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
