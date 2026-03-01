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

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const body = await req.json();

    const render = await prisma.roomRender.create({
      data: {
        roomId,
        style: body.style,
        designNotes: body.designNotes,
        sourcePhotoUrl: body.sourcePhotoUrl,
        // Legacy fields
        wallColor: body.wallColor,
        wallColorName: body.wallColorName,
        curtainStyle: body.curtainStyle,
        furnitureStyle: body.furnitureStyle,
        referenceUrls: body.referenceUrls || [],
      },
    });
    return NextResponse.json(render, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
