import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

let _resend: Resend | undefined;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  _resend ??= new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = () => process.env.EMAIL_FROM || "Nook & Nest <onboarding@resend.dev>";
const APP_URL = () => (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(heading: string, body: string, cta: { label: string; url: string }) {
  return `
  <div style="background:#FAF8F5;padding:32px 16px;font-family:Georgia,serif;color:#1A1A1A">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E0DCD6;padding:32px">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8B7355;margin:0 0 16px">Nook &amp; Nest</p>
      <h1 style="font-weight:300;font-size:24px;margin:0 0 16px">${heading}</h1>
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#4A4A4A">${body}</div>
      <a href="${cta.url}" style="display:inline-block;margin-top:24px;background:#8B7355;color:#FFFFFF;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:12px 20px">${cta.label}</a>
    </div>
  </div>`;
}

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM(), to, subject, html });
  if (error) console.error(`[email] failed "${subject}" to ${to}:`, error);
}

async function loadRound(roundId: string) {
  return prisma.designRound.findUnique({
    where: { id: roundId },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true,
              client: { select: { name: true, email: true } },
              designer: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
}

// Tell the client a design round is ready for review. Never throws.
export async function notifyRoundSent(roundId: string) {
  try {
    const round = await loadRound(roundId);
    if (!round) return;
    const { room } = round;
    const { project } = room;
    const note = round.designerNote ? `<p style="border-left:2px solid #8B7355;padding-left:12px">${escapeHtml(round.designerNote)}</p>` : "";
    await send(
      project.client.email,
      `${room.name}: design round ${round.number} is ready for your review`,
      layout(
        `${escapeHtml(room.name)} is ready for your review`,
        `<p>Hi ${escapeHtml(project.client.name.split(" ")[0])},</p>
         <p>${escapeHtml(project.designer.name)} has shared design round ${round.number} for <strong>${escapeHtml(room.name)}</strong> in ${escapeHtml(project.name)}.</p>
         ${note}
         <p>Take a look and approve it, or let us know what you'd like changed.</p>`,
        { label: "Review Design", url: `${APP_URL()}/client/projects/${project.id}#space-${room.id}` },
      ),
    );
  } catch (err) {
    console.error("[email] notifyRoundSent", err);
  }
}

// Tell the designer the client approved a round or asked for changes. Never throws.
export async function notifyRoundResponse(roundId: string) {
  try {
    const round = await loadRound(roundId);
    if (!round || round.status === "PENDING") return;
    const { room } = round;
    const { project } = room;
    const approved = round.status === "APPROVED";
    const feedback = round.clientFeedback ? `<p style="border-left:2px solid #8B7355;padding-left:12px">${escapeHtml(round.clientFeedback)}</p>` : "";
    await send(
      project.designer.email,
      approved
        ? `${project.client.name} approved ${room.name}`
        : `${project.client.name} requested changes to ${room.name}`,
      layout(
        approved ? `${escapeHtml(room.name)} approved` : `Changes requested for ${escapeHtml(room.name)}`,
        `<p>${escapeHtml(project.client.name)} ${approved ? "approved" : "requested changes to"} design round ${round.number} for <strong>${escapeHtml(room.name)}</strong> in ${escapeHtml(project.name)}.${approved ? " The space is now marked completed." : ""}</p>
         ${feedback}`,
        { label: "Open Review", url: `${APP_URL()}/designer/projects/${project.id}/rooms/${room.id}/review` },
      ),
    );
  } catch (err) {
    console.error("[email] notifyRoundResponse", err);
  }
}
