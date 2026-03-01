import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (err) {
    console.error("/api/auth/me error:", err);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
