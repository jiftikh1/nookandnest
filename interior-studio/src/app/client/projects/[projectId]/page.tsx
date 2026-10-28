import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ClientComments from "./ClientComments";
import ClientRenderGallery from "./ClientRenderGallery";
import RoundResponse from "./RoundResponse";
import ProjectProgress from "./ProjectProgress";
import SpaceStatusBadge from "@/components/designer/SpaceStatusBadge";
import { revisionsUsed, revisionsAllowed } from "@/lib/spaces";

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
      // Visible once published, or as soon as any space has been sent for review
      OR: [
        { status: { in: ["PUBLISHED", "COMPLETED"] } },
        { rooms: { some: { rounds: { some: {} } } } },
      ],
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
          rounds: { orderBy: { number: "desc" } },
        },
      },
      milestones: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { room: { select: { name: true } } },
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

      <ProjectProgress project={project} rooms={project.rooms} milestones={project.milestones} />

      {/* Design Ideas CTA */}
      <div className="mb-10 p-6 border rounded-sm flex items-center justify-between" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
        <div>
          <p className="text-sm font-medium mb-0.5" style={{ color: "#1A1A1A" }}>Design Ideas</p>
          <p className="text-sm" style={{ color: "#7A7A7A" }}>Review and respond to design ideas from your designer.</p>
        </div>
        <Link href={`/client/projects/${projectId}/ideas`} className="text-xs tracking-widest uppercase px-4 py-2.5 shrink-0" style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}>
          View Ideas →
        </Link>
      </div>

      {/* Rooms */}
      {project.rooms.map((room) => {
        const used = revisionsUsed(room.rounds);
        const allowed = revisionsAllowed(room, project);
        const renderUrlById = new Map(room.renders.map((r) => [r.id, r.generatedImageUrl]));
        const roundImages = (round: (typeof room.rounds)[number]) => [
          ...round.renderIds.map((id) => renderUrlById.get(id)).filter((u): u is string => !!u),
          ...round.photoUrls,
        ];
        const pending = room.rounds.find((r) => r.status === "PENDING");
        const pastRounds = room.rounds.filter((r) => r.status !== "PENDING");

        return (
        <div key={room.id} id={`space-${room.id}`} className="mb-16 pb-16 border-b last:border-0" style={{ borderColor: "#E0DCD6" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <h2 className="text-3xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
              {room.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: used > allowed ? "#C62828" : "#7A7A7A" }}>
                {used} of {allowed} revisions used
              </span>
              <SpaceStatusBadge status={room.status} />
            </div>
          </div>

          {/* Design round awaiting the client's response */}
          {pending && room.status !== "COMPLETED" && (
            <div className="mb-10 p-6 border rounded-sm" style={{ borderColor: "#8B7355", backgroundColor: "#FBF9F7" }}>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#8B7355" }}>Ready for your review</p>
              <p className="text-lg font-light mb-4" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                Design round {pending.number}
              </p>
              {pending.designerNote && (
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A4A4A" }}>{pending.designerNote}</p>
              )}
              {roundImages(pending).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {roundImages(pending).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                      className="relative h-48 rounded-sm overflow-hidden border block" style={{ borderColor: "#E0DCD6" }}>
                      <Image src={url} alt={`${room.name} round ${pending.number}`} fill className="object-cover" unoptimized />
                    </a>
                  ))}
                </div>
              )}
              <RoundResponse roundId={pending.id} revisionsUsed={used} revisionsAllowed={allowed} />
            </div>
          )}

          {/* Past rounds */}
          {pastRounds.length > 0 && (
            <details className="mb-10 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
              <summary className="cursor-pointer px-5 py-3 text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>
                Review history · {pastRounds.length} round{pastRounds.length !== 1 ? "s" : ""}
              </summary>
              <div className="px-5 pb-5 space-y-5">
                {pastRounds.map((round) => (
                  <div key={round.id} className="pt-4 border-t" style={{ borderColor: "#F0EDE8" }}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                        Round {round.number}
                        <span className="font-normal ml-2" style={{ color: "#7A7A7A" }}>
                          {round.sentAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </p>
                      <span className="text-xs tracking-widest uppercase" style={{ color: round.status === "APPROVED" ? "#4A7B5B" : "#C62828" }}>
                        {round.status === "APPROVED" ? "Approved" : "Changes requested"}
                      </span>
                    </div>
                    {roundImages(round).length > 0 && (
                      <div className="flex gap-2 mb-2 overflow-x-auto">
                        {roundImages(round).map((url) => (
                          <div key={url} className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border" style={{ borderColor: "#E0DCD6" }}>
                            <Image src={url} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>
                    )}
                    {round.designerNote && <p className="text-sm mb-1" style={{ color: "#4A4A4A" }}>{round.designerNote}</p>}
                    {round.clientFeedback && (
                      <p className="text-sm" style={{ color: "#7A7A7A" }}>Your feedback: {round.clientFeedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

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
        );
      })}

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
