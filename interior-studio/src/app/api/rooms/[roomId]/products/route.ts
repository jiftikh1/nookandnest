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

async function verifyRoom(roomId: string, designerId: string) {
  return prisma.room.findFirst({
    where: { id: roomId, project: { designerId } },
    select: { id: true },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const room = await verifyRoom(roomId, designerId);
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const products = await prisma.product.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const designerId = await getDesignerId();
    if (!designerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roomId } = await params;
    const room = await verifyRoom(roomId, designerId);
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        supplier: body.supplier,
        price: body.price ? parseFloat(body.price) : null,
        currency: body.currency || "USD",
        productUrl: body.productUrl,
        imageUrl: body.imageUrl,
        category: body.category,
        notes: body.notes,
        isVisible: body.isVisible !== false,
        roomId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
