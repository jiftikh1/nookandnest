import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { editRoomWithFluxFill } from "@/lib/replicate";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

function extractFilename(url: string): string | null {
  const marker = "/room-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

async function getAccessibleUrl(originalUrl: string): Promise<string> {
  const filename = extractFilename(originalUrl);
  if (!filename) return originalUrl;
  const { data } = await supabaseAdmin.storage.from("room-photos").createSignedUrl(filename, 3600);
  return data?.signedUrl ?? originalUrl;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ renderId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { renderId } = await params;
    const { maskDataUrl, prompt, sourcePhotoUrl } = await req.json();

    if (!maskDataUrl) return NextResponse.json({ error: "Mask image is required" }, { status: 400 });

    const render = await prisma.roomRender.findUnique({
      where: { id: renderId },
      include: { room: true },
    });

    if (!render) return NextResponse.json({ error: "Render not found" }, { status: 404 });

    const sourcePhoto = sourcePhotoUrl ?? render.sourcePhotoUrl ?? render.room.originalPhotoUrl;
    if (!sourcePhoto) return NextResponse.json({ error: "No source photo found" }, { status: 400 });

    await prisma.roomRender.update({ where: { id: renderId }, data: { status: "GENERATING" } });

    // Build mask Blob from base64 data URL
    const base64Data = maskDataUrl.replace(/^data:image\/png;base64,/, "");
    const maskBuffer = Buffer.from(base64Data, "base64");
    const maskBlob = new Blob([maskBuffer], { type: "image/png" });

    // Download source photo — detect format from magic bytes so Replicate
    // gets the correct content-type regardless of what Supabase headers say
    const accessiblePhotoUrl = await getAccessibleUrl(sourcePhoto);
    const photoRes = await fetch(accessiblePhotoUrl);
    if (!photoRes.ok) throw new Error("Failed to fetch source photo");
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

    // Magic byte format detection
    let imageMime = "image/jpeg";
    let imageExt = "jpg";
    if (photoBuffer[0] === 0x89 && photoBuffer[1] === 0x50) { imageMime = "image/png"; imageExt = "png"; }
    else if (photoBuffer[0] === 0x52 && photoBuffer[1] === 0x49 && photoBuffer[8] === 0x57 && photoBuffer[9] === 0x45) { imageMime = "image/webp"; imageExt = "webp"; }
    else if (photoBuffer[0] === 0x47 && photoBuffer[1] === 0x49 && photoBuffer[2] === 0x46) { imageMime = "image/gif"; imageExt = "gif"; }

    console.error(`[edit] photo: ${imageMime} ${photoBuffer.length}B | mask: ${maskBuffer.length}B (PNG header: ${maskBuffer.slice(0, 4).toString("hex")})`);

    const imageBlob = new Blob([photoBuffer], { type: imageMime });

    const finalPrompt = prompt?.trim() ||
      "clean empty room, reveal the floor and walls behind the removed items, seamless photorealistic interior photography, same lighting and materials";

    const generatedImageUrl = await editRoomWithFluxFill({
      imageBlob,
      maskBlob,
      prompt: finalPrompt,
    });

    await prisma.roomRender.update({
      where: { id: renderId },
      data: {
        status: "COMPLETED",
        generatedImageUrl,
        sourcePhotoUrl: sourcePhoto,
        designNotes: prompt || "Remove selected items",
        claudePrompt: finalPrompt,
      },
    });

    return NextResponse.json({ success: true, imageUrl: generatedImageUrl });
  } catch (err) {
    console.error("Edit failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Edit failed";
    const { renderId } = await params;
    await prisma.roomRender.update({ where: { id: renderId }, data: { status: "FAILED" } }).catch(() => {});
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
