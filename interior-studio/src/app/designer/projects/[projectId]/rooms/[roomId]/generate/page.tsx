import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GenerateForm from "./GenerateForm";
import EditForm from "./EditForm";

async function getDesignerId() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! }, select: { id: true } });
  return dbUser?.id;
}

export default async function GeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; roomId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { projectId, roomId } = await params;
  const { mode } = await searchParams;
  const isEditMode = mode === "edit";

  const designerId = await getDesignerId();
  if (!designerId) redirect("/login");

  const room = await prisma.room.findFirst({
    where: { id: roomId, project: { designerId } },
    select: {
      id: true,
      name: true,
      originalPhotoUrl: true,
      photoUrls: true,
      project: { select: { name: true } },
    },
  });

  if (!room) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-2">
        <Link href={`/designer/projects/${projectId}/rooms/${roomId}/renders`}
          className="text-xs tracking-widest uppercase" style={{ color: "#8B7355" }}>
          ← Renders
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#7A7A7A" }}>
          {room.project.name} · {room.name}
        </p>
        <h1 className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
          {isEditMode ? "Edit Room" : "Generate Render"}
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-10 p-1 border rounded-sm w-fit" style={{ borderColor: "#E0DCD6" }}>
        <Link
          href={`/designer/projects/${projectId}/rooms/${roomId}/generate`}
          className="px-5 py-2 text-xs tracking-widest uppercase rounded-sm transition-colors"
          style={{
            backgroundColor: !isEditMode ? "#8B7355" : "transparent",
            color: !isEditMode ? "#FFFFFF" : "#7A7A7A",
          }}>
          + Generate
        </Link>
        <Link
          href={`/designer/projects/${projectId}/rooms/${roomId}/generate?mode=edit`}
          className="px-5 py-2 text-xs tracking-widest uppercase rounded-sm transition-colors"
          style={{
            backgroundColor: isEditMode ? "#8B7355" : "transparent",
            color: isEditMode ? "#FFFFFF" : "#7A7A7A",
          }}>
          ✏ Edit / Remove
        </Link>
      </div>

      {/* Mode descriptions */}
      <p className="text-sm mb-8 -mt-4" style={{ color: "#7A7A7A" }}>
        {isEditMode
          ? "Paint over furniture or items you want removed. Flux Fill will reveal the floor and walls behind them."
          : "Pick what to add — carpets, furniture, lighting — and the room structure stays exactly as it is."}
      </p>

      {isEditMode ? (
        <EditForm
          projectId={projectId}
          roomId={roomId}
          photos={room.photoUrls ?? []}
          primaryPhoto={room.originalPhotoUrl ?? null}
        />
      ) : (
        <GenerateForm
          projectId={projectId}
          roomId={roomId}
          photos={room.photoUrls ?? []}
          primaryPhoto={room.originalPhotoUrl ?? null}
        />
      )}
    </div>
  );
}
