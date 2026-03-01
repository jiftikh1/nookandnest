import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { analyzeRoomWithClaude, buildDesignPrompt } from "@/lib/openai";
import { generateRoomRender } from "@/lib/replicate";
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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ renderId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { renderId } = await params;

    const render = await prisma.roomRender.findUnique({
      where: { id: renderId },
      include: { room: true },
    });

    if (!render) return NextResponse.json({ error: "Render not found" }, { status: 404 });

    // Prefer sourcePhotoUrl, fall back to room's primary photo
    const sourcePhoto = render.sourcePhotoUrl ?? render.room.originalPhotoUrl;
    if (!sourcePhoto) {
      return NextResponse.json(
        { error: "No source photo. Add room photos first, then generate." },
        { status: 400 }
      );
    }

    if (!render.designNotes?.trim()) {
      return NextResponse.json(
        { error: "Design notes are required. Describe the changes you want." },
        { status: 400 }
      );
    }

    await prisma.roomRender.update({ where: { id: renderId }, data: { status: "GENERATING" } });

    const accessiblePhotoUrl = await getAccessibleUrl(sourcePhoto);

    // Step 1: Claude Vision — analyze the existing room in detail
    const roomAnalysis = await analyzeRoomWithClaude(accessiblePhotoUrl);

    // Step 2: Claude — build an optimized ControlNet-compatible design prompt
    const replicatePrompt = await buildDesignPrompt({
      roomAnalysis,
      designNotes: render.designNotes,
      style: render.style ?? "Photorealistic",
    });

    // Step 3: Replicate ControlNet (adirik/interior-design) — image-to-image generation
    // that locks room structure via depth mapping so walls/windows/doors are preserved
    const generatedImageUrl = await generateRoomRender({
      prompt: replicatePrompt,
      roomPhotoUrl: accessiblePhotoUrl,
    });

    await prisma.roomRender.update({
      where: { id: renderId },
      data: {
        status: "COMPLETED",
        gptAnalysis: roomAnalysis,
        claudePrompt: replicatePrompt, // stores the final prompt sent to Replicate
        generatedImageUrl,
      },
    });

    return NextResponse.json({ success: true, imageUrl: generatedImageUrl });
  } catch (err) {
    console.error("Generation failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Generation failed";
    const { renderId } = await params;
    await prisma.roomRender.update({ where: { id: renderId }, data: { status: "FAILED" } }).catch(() => {});
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
