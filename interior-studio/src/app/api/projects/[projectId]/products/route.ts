import { NextResponse } from "next/server";

// Products are now room-level. Use /api/rooms/[roomId]/products instead.
export async function POST() {
  return NextResponse.json(
    { error: "Products are now room-level. Use /api/rooms/[roomId]/products" },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json([]);
}
