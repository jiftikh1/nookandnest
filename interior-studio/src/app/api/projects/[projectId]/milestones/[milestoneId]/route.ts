import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { parseMilestoneFields } from "../parse";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true, role: true } });
  return dbUser?.role === "DESIGNER" || dbUser?.role === "ADMIN" ? dbUser.id : null;
}

type Params = { params: Promise<{ projectId: string; milestoneId: string }> };

async function findOwned(projectId: string, milestoneId: string, designerId: string) {
  return prisma.paymentMilestone.findFirst({
    where: { id: milestoneId, projectId, project: { designerId } },
    select: { id: true, status: true },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId, milestoneId } = await params;

    const existing = await findOwned(projectId, milestoneId, designerId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const { data, error } = await parseMilestoneFields(body, projectId);
    if (error) return NextResponse.json({ error }, { status: 400 });
    // Keep the original paid date when a paid milestone is re-saved as paid
    if (data.status === "PAID" && existing.status === "PAID") delete data.paidAt;

    const milestone = await prisma.paymentMilestone.update({ where: { id: milestoneId }, data });
    return NextResponse.json(milestone);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId, milestoneId } = await params;

    const existing = await findOwned(projectId, milestoneId, designerId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.paymentMilestone.delete({ where: { id: milestoneId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
