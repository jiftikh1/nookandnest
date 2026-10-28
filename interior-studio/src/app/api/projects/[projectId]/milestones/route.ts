import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { parseMilestoneFields } from "./parse";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;

    const milestones = await prisma.paymentMilestone.findMany({
      where: { projectId, project: { designerId } },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(milestones);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, designerId },
      select: { id: true, _count: { select: { milestones: true } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const { data, error } = await parseMilestoneFields(body, projectId);
    if (error) return NextResponse.json({ error }, { status: 400 });
    if (!data.label || data.amount === undefined) {
      return NextResponse.json({ error: "Label and amount are required" }, { status: 400 });
    }

    const milestone = await prisma.paymentMilestone.create({
      data: { ...data, label: data.label, amount: data.amount, projectId, order: project._count.milestones },
    });
    return NextResponse.json(milestone, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
