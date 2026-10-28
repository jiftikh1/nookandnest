import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notifyRoundResponse } from "@/lib/email";

// POST /api/rounds/[roundId]/respond — client approves a design round or requests changes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roundId } = await params;
    const body = await req.json();
    const decision = body.decision; // "APPROVED" | "CHANGES_REQUESTED"
    const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";

    if (!["APPROVED", "CHANGES_REQUESTED"].includes(decision)) {
      return NextResponse.json({ error: "decision must be APPROVED or CHANGES_REQUESTED" }, { status: 400 });
    }
    if (decision === "CHANGES_REQUESTED" && !feedback) {
      return NextResponse.json({ error: "Please describe the changes you'd like" }, { status: 400 });
    }

    const round = await prisma.designRound.findUnique({
      where: { id: roundId },
      include: { room: { select: { id: true, status: true, project: { select: { clientId: true } } } } },
    });
    if (!round) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (round.room.project.clientId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (round.status !== "PENDING") return NextResponse.json({ error: "This round has already been answered" }, { status: 400 });
    if (round.room.status === "COMPLETED") return NextResponse.json({ error: "This space is already completed" }, { status: 400 });

    const now = new Date();
    const approved = decision === "APPROVED";

    const updated = await prisma.$transaction(async (tx) => {
      // Guard against a double submit: only answer a round that is still pending
      const { count } = await tx.designRound.updateMany({
        where: { id: roundId, status: "PENDING" },
        data: { status: decision, clientFeedback: feedback || null, respondedAt: now },
      });
      if (count === 0) return null;
      await tx.room.update({
        where: { id: round.room.id },
        data: approved ? { status: "COMPLETED", completedAt: now } : { status: "CHANGES_REQUESTED" },
      });
      return tx.designRound.findUnique({ where: { id: roundId } });
    });

    if (!updated) return NextResponse.json({ error: "This round has already been answered" }, { status: 400 });
    after(() => notifyRoundResponse(roundId));
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
