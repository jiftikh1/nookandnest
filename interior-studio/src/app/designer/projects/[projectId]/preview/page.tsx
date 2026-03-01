import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function PreviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, designerId },
    include: {
      client: { select: { name: true } },
      rooms: {
        orderBy: { order: "asc" },
        include: {
          moodBoards: { include: { items: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
          products: { where: { isVisible: true }, orderBy: { createdAt: "asc" } },
          renders: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/designer/projects/${projectId}`} className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Project
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-sm" style={{ backgroundColor: "#E8F5E9", color: "#4A7B5B" }}>
            Preview Mode — Client View
          </span>
          <Link href={`/designer/projects/${projectId}/publish`} className="text-xs tracking-widest uppercase px-5 py-2" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
            Publish →
          </Link>
        </div>
      </div>

      {/* Client view simulation */}
      <div className="border rounded-sm overflow-hidden mt-8" style={{ borderColor: "#E0DCD6" }}>
        {/* Header */}
        <div className="px-10 py-12 border-b" style={{ borderColor: "#E0DCD6", backgroundColor: "#FAFAF9" }}>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>Interior Design Project</p>
          <h1 className="text-5xl font-light mb-3" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-base" style={{ color: "#4A4A4A", maxWidth: "60ch" }}>{project.description}</p>
          )}
          {project.clientMessage && (
            <div className="mt-6 p-5 border-l-2 rounded-r-sm" style={{ borderColor: "#8B7355", backgroundColor: "#FFFFFF" }}>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#8B7355" }}>Message from your designer</p>
              <p className="text-sm leading-relaxed" style={{ color: "#1A1A1A" }}>{project.clientMessage}</p>
            </div>
          )}
        </div>

        {/* Rooms */}
        <div className="divide-y" style={{ borderColor: "#E0DCD6" }}>
          {project.rooms.map((room) => (
            <div key={room.id} className="px-10 py-10">
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                {room.name}
              </h2>

              {/* Photos */}
              {room.photoUrls.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>Photos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {room.photoUrls.map((url, i) => (
                      <div key={i} className="relative h-48 rounded-sm overflow-hidden">
                        <Image src={url} alt={`${room.name} photo ${i + 1}`} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renders */}
              {room.renders.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>AI Renders</p>
                  <div className="grid grid-cols-2 gap-4">
                    {room.renders.map((render) => (
                      <div key={render.id} className="relative h-56 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                        {render.generatedImageUrl && (
                          <Image src={render.generatedImageUrl} alt="Render" fill className="object-cover" unoptimized />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mood Boards */}
              {room.moodBoards.map((board) => (
                <div key={board.id} className="mb-8">
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>{board.title}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {board.items.map((item) => (
                      <div key={item.id}>
                        <div className="relative h-32 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                          <Image src={item.imageUrl} alt={item.caption ?? ""} fill className="object-cover" unoptimized />
                        </div>
                        {item.caption && <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>{item.caption}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Products */}
              {room.products.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>Recommended Items</p>
                  <div className="grid grid-cols-2 gap-4">
                    {room.products.map((product) => (
                      <div key={product.id} className="flex gap-4 p-4 border rounded-sm" style={{ borderColor: "#E0DCD6" }}>
                        {product.imageUrl && (
                          <div className="relative w-16 h-16 shrink-0 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{product.name}</p>
                          {product.supplier && <p className="text-xs" style={{ color: "#7A7A7A" }}>{product.supplier}</p>}
                          {product.price && <p className="text-sm" style={{ color: "#8B7355" }}>{product.currency} {product.price.toFixed(2)}</p>}
                          {product.productUrl && (
                            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-xs tracking-widest uppercase underline mt-1 inline-block" style={{ color: "#8B7355" }}>
                              View Product
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
