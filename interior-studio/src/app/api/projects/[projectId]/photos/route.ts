import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, designerId },
      include: { rooms: { select: { id: true, name: true, photoUrls: true } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: files, error } = await supabaseAdmin.storage
      .from("room-photos")
      .list(`projects/${projectId}`, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      // Folder may not exist yet — return empty
      return NextResponse.json([]);
    }

    const photos = (files ?? [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.name)
      .map((f) => {
        const path = `projects/${projectId}/${f.name}`;
        const { data: { publicUrl } } = supabaseAdmin.storage.from("room-photos").getPublicUrl(path);
        const taggedRooms = project.rooms
          .filter((r) => r.photoUrls.includes(publicUrl))
          .map((r) => ({ id: r.id, name: r.name }));
        return { name: f.name, url: publicUrl, createdAt: f.created_at ?? new Date().toISOString(), rooms: taggedRooms };
      });

    return NextResponse.json(photos);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;
    const url = new URL(req.url).searchParams.get("url");
    if (!url) return NextResponse.json({ error: "url param required" }, { status: 400 });

    const project = await prisma.project.findFirst({
      where: { id: projectId, designerId },
      include: { rooms: { select: { id: true, photoUrls: true, originalPhotoUrl: true } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    for (const room of project.rooms) {
      if (room.photoUrls.includes(url)) {
        const newUrls = room.photoUrls.filter((u) => u !== url);
        await prisma.room.update({
          where: { id: room.id },
          data: {
            photoUrls: newUrls,
            originalPhotoUrl: room.originalPhotoUrl === url ? (newUrls[0] ?? null) : room.originalPhotoUrl,
          },
        });
      }
    }

    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/room-photos\/(.+)/);
    if (pathMatch) {
      await supabaseAdmin.storage.from("room-photos").remove([pathMatch[1]]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
