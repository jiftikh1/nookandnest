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

export async function GET() {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await prisma.project.findMany({
      where: { designerId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { rooms: true, ideas: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, clientEmail, clientName } = body;

    if (!name || !clientEmail || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert client user
    let client = await prisma.user.findUnique({ where: { email: clientEmail } });
    if (!client) {
      client = await prisma.user.create({
        data: { email: clientEmail, name: clientName, role: "CLIENT", updatedAt: new Date() },
      });
    }

    const project = await prisma.project.create({
      data: { name, description, clientId: client.id, designerId },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
