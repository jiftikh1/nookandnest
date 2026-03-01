import { NextResponse } from "next/server";

// Mood boards are now room-level. Use /api/rooms/[roomId]/mood-boards instead.
export async function POST() {
  return NextResponse.json(
    { error: "Mood boards are now room-level. Use /api/rooms/[roomId]/mood-boards" },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json([]);
}
