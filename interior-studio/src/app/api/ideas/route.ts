import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "DESIGNER")) return null;
  return dbUser;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, title, description, imageUrls, category, internalNotes, externalNotes } = body;

  if (!projectId || !title) {
    return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
  }

  // Verify the project belongs to this admin
  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId: admin.id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const idea = await prisma.designIdea.create({
    data: {
      projectId,
      title,
      description: description || null,
      imageUrls: imageUrls || [],
      category: category || null,
      internalNotes: internalNotes || null,
      externalNotes: externalNotes || null,
    },
  });

  return NextResponse.json(idea, { status: 201 });
}
