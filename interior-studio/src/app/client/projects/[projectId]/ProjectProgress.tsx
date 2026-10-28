import type { SpaceStatus, MilestoneStatus } from "@prisma/client";
import SpaceStatusBadge from "@/components/designer/SpaceStatusBadge";
import ProgressBar from "@/components/ProgressBar";
import { revisionsUsed, revisionsAllowed, isOverdue, projectProgress } from "@/lib/spaces";
import { MILESTONE_STATUS_META, formatMoney } from "@/lib/contract";

interface Props {
  project: {
    contractedSpaces: number | null;
    revisionsPerSpace: number;
    contractValue: number | null;
    currency: string;
    targetDate: Date | null;
  };
  rooms: {
    id: string;
    name: string;
    status: SpaceStatus;
    targetDate: Date | null;
    completedAt: Date | null;
    revisionsIncluded: number | null;
    rounds: { status: string }[];
  }[];
  milestones: {
    id: string;
    label: string;
    amount: number;
    dueDate: Date | null;
    status: MilestoneStatus;
    paidAt: Date | null;
    room: { name: string } | null;
  }[];
}

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function ProjectProgress({ project, rooms, milestones }: Props) {
  const progress = projectProgress(project, rooms);
  const awaiting = rooms.filter((r) => r.rounds.some((round) => round.status === "PENDING") && r.status !== "COMPLETED");
  const notYetAdded = progress.total - rooms.length;
  const paid = milestones.filter((m) => m.status === "PAID").reduce((sum, m) => sum + m.amount, 0);
  const hasContract = project.contractValue !== null || milestones.length > 0;

  return (
    <div className="mb-12 space-y-6">
      {/* Overall delivery progress */}
      <section className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Progress</p>
            <p className="text-3xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
              {progress.completed} of {progress.total} space{progress.total !== 1 ? "s" : ""} complete
            </p>
          </div>
          <div className="text-sm text-right" style={{ color: "#7A7A7A" }}>
            {project.targetDate && <p>Target completion {fmtDate(project.targetDate)}</p>}
            <p>{project.revisionsPerSpace} revision{project.revisionsPerSpace !== 1 ? "s" : ""} included per space</p>
          </div>
        </div>
        <ProgressBar pct={progress.pct} height={8} />

        {awaiting.length > 0 && (
          <div className="mt-5 p-4 border-l-2 text-sm" style={{ borderColor: "#8B7355", backgroundColor: "#FBF9F7", color: "#1A1A1A" }}>
            {awaiting.length === 1 ? "1 space is" : `${awaiting.length} spaces are`} waiting for your review:{" "}
            {awaiting.map((r, i) => (
              <span key={r.id}>
                {i > 0 && ", "}
                <a href={`#space-${r.id}`} className="underline" style={{ color: "#8B7355" }}>{r.name}</a>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Per-space status */}
      {rooms.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const used = revisionsUsed(room.rounds);
            const allowed = revisionsAllowed(room, project);
            const overdue = isOverdue(room);
            return (
              <a key={room.id} href={`#space-${room.id}`}
                className="p-5 border rounded-sm hover:border-[#8B7355] transition-colors block"
                style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-lg font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>{room.name}</p>
                  <SpaceStatusBadge status={room.status} />
                </div>
                <div className="space-y-1 text-xs" style={{ color: "#7A7A7A" }}>
                  <p style={{ color: used > allowed ? "#C62828" : undefined }}>
                    Revisions: {used} of {allowed} used{used > allowed && ` · ${used - allowed} extra`}
                  </p>
                  {room.status === "COMPLETED" && room.completedAt ? (
                    <p style={{ color: "#4A7B5B" }}>Completed {fmtDate(room.completedAt)}</p>
                  ) : room.targetDate ? (
                    <p style={{ color: overdue ? "#C62828" : undefined }}>
                      {overdue ? "Past target date · " : "Target "}{fmtDate(room.targetDate)}
                    </p>
                  ) : null}
                </div>
              </a>
            );
          })}
          {notYetAdded > 0 && (
            <div className="p-5 border border-dashed rounded-sm flex items-center justify-center text-center"
              style={{ borderColor: "#E0DCD6" }}>
              <p className="text-xs tracking-widest uppercase" style={{ color: "#9E9E9E" }}>
                {notYetAdded} more space{notYetAdded !== 1 ? "s" : ""} in scope
              </p>
            </div>
          )}
        </section>
      )}

      {/* Contract & payments */}
      {hasContract && (
        <section className="p-6 border rounded-sm" style={{ borderColor: "#E0DCD6", backgroundColor: "#FFFFFF" }}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7A7A7A" }}>Contract</p>
              {project.contractValue !== null && (
                <p className="text-2xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}>
                  {formatMoney(project.contractValue, project.currency)}
                </p>
              )}
            </div>
            {milestones.length > 0 && (
              <p className="text-sm" style={{ color: "#7A7A7A" }}>
                {formatMoney(paid, project.currency)} paid
                {project.contractValue !== null && ` of ${formatMoney(project.contractValue, project.currency)}`}
              </p>
            )}
          </div>
          {project.contractValue !== null && project.contractValue > 0 && milestones.length > 0 && (
            <div className="mb-5"><ProgressBar pct={Math.min(100, Math.round((paid / project.contractValue) * 100))} /></div>
          )}

          {milestones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs tracking-widest uppercase" style={{ color: "#7A7A7A" }}>
                    <th className="py-2 pr-4 font-normal">Payment</th>
                    <th className="py-2 pr-4 font-normal text-right">Amount</th>
                    <th className="py-2 pr-4 font-normal">Due</th>
                    <th className="py-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => {
                    const meta = MILESTONE_STATUS_META[m.status];
                    return (
                      <tr key={m.id} className="border-t" style={{ borderColor: "#F0EDE8" }}>
                        <td className="py-3 pr-4">
                          <p style={{ color: "#1A1A1A" }}>{m.label}</p>
                          {m.room && <p className="text-xs" style={{ color: "#7A7A7A" }}>{m.room.name}</p>}
                        </td>
                        <td className="py-3 pr-4 text-right whitespace-nowrap" style={{ color: "#1A1A1A" }}>{formatMoney(m.amount, project.currency)}</td>
                        <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "#4A4A4A" }}>{m.dueDate ? fmtDate(m.dueDate) : "—"}</td>
                        <td className="py-3">
                          <span className="text-xs tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.text }}>
                            {meta.label}{m.status === "PAID" && m.paidAt && ` · ${fmtDate(m.paidAt)}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
