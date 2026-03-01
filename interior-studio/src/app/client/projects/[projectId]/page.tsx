import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ClientComments from "./ClientComments";
import ClientRenderGallery from "./ClientRenderGallery";

async function getClient() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  return dbUser;
}

export default async function ClientProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const client = await getClient();
  if (!client) redirect("/login");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      clientId: client.id,
      status: { in: ["PUBLISHED", "COMPLETED"] },
    },
    include: {
      designer: { select: { name: true } },
      rooms: {
        orderBy: { order: "asc" },
        include: {
          moodBoards: {
            include: { items: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
          products: { where: { isVisible: true }, orderBy: { createdAt: "asc" } },
          renders: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
        },
      },
      comments: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-4">
        <Link href="/client/dashboard" className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12 pb-10 border-b" style={{ borderColor: "#E0DCD6" }}>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>
          Interior Design by {project.designer.name}
        </p>
        <h1 className="text-5xl font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          {project.name}
        </h1>
        {project.description && (
          <p className="text-base mb-6" style={{ color: "#4A4A4A", maxWidth: "65ch" }}>{project.description}</p>
        )}
        {project.clientMessage && (
          <div className="p-6 border-l-2 rounded-r-sm" style={{ borderColor: "#8B7355", backgroundColor: "#FBF9F7" }}>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#8B7355" }}>Message from {project.designer.name}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#1A1A1A" }}>{project.clientMessage}</p>
          </div>
        )}
      </div>

      {/* Rooms */}
      {project.rooms.map((room) => (
        <div key={room.id} className="mb-16 pb-16 border-b last:border-0" style={{ borderColor: "#E0DCD6" }}>
          <h2 className="text-3xl font-light mb-8" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
            {room.name}
          </h2>

          {/* Photo gallery */}
          {room.photoUrls.length > 0 && (
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>Photos</p>
              <div className="grid grid-cols-3 gap-3">
                {room.photoUrls.map((url, i) => (
                  <div key={i} className="relative h-52 rounded-sm overflow-hidden border cursor-zoom-in" style={{ borderColor: "#E0DCD6" }}>
                    <Image src={url} alt={`${room.name} photo`} fill className="object-cover hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Renders */}
          {room.renders.length > 0 && (
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>AI Design Renders</p>
              <ClientRenderGallery renders={room.renders} />
            </div>
          )}

          {/* Mood Boards */}
          {room.moodBoards.map((board) => board.items.length > 0 && (
            <div key={board.id} className="mb-8">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7A7A7A" }}>{board.title}</p>
              {board.description && <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>{board.description}</p>}
              <div className="grid grid-cols-4 gap-3">
                {board.items.map((item) => (
                  <div key={item.id}>
                    <div className="relative h-36 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                      <Image src={item.imageUrl} alt={item.caption ?? ""} fill className="object-cover" unoptimized />
                    </div>
                    {item.caption && <p className="text-xs mt-1.5" style={{ color: "#7A7A7A" }}>{item.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Product picks */}
          {room.products.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#7A7A7A" }}>Recommended Items</p>
              <div className="grid grid-cols-2 gap-4">
                {room.products.map((product) => (
                  <div key={product.id} className="flex gap-4 p-5 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
                    {product.imageUrl && (
                      <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-0.5" style={{ color: "#1A1A1A" }}>{product.name}</p>
                      {product.supplier && <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{product.supplier}</p>}
                      {product.category && (
                        <span className="text-xs tracking-widest uppercase px-2 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: "#F0EDE8", color: "#8B7355" }}>{product.category}</span>
                      )}
                      {product.price && (
                        <p className="text-sm font-medium mt-1" style={{ color: "#8B7355" }}>
                          {product.currency} {product.price.toFixed(2)}
                        </p>
                      )}
                      {product.productUrl && (
                        <a href={product.productUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs tracking-widest uppercase underline mt-2 block" style={{ color: "#8B7355" }}>
                          View Product →
                        </a>
                      )}
                      {product.notes && <p className="text-xs mt-1" style={{ color: "#9E9E9E" }}>{product.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Comments */}
      <div className="mt-10">
        <h2 className="text-2xl font-light mb-6" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          Comments & Feedback
        </h2>
        <ClientComments
          projectId={projectId}
          initialComments={project.comments}
          currentUserId={client.id}
        />
      </div>
    </div>
  );
}
