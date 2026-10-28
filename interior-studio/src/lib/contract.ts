import type { MilestoneStatus } from "@prisma/client";

export const MILESTONE_STATUSES: MilestoneStatus[] = ["UPCOMING", "INVOICED", "PAID"];

export const MILESTONE_STATUS_META: Record<MilestoneStatus, { label: string; bg: string; text: string }> = {
  UPCOMING: { label: "Upcoming", bg: "#F0EDE8", text: "#7A7A7A" },
  INVOICED: { label: "Invoiced", bg: "#FFF8E7", text: "#B8860B" },
  PAID:     { label: "Paid",     bg: "#E8F5E9", text: "#4A7B5B" },
};

export interface ContractFields {
  contractedSpaces?: number | null;
  revisionsPerSpace?: number;
  contractValue?: number | null;
  currency?: string;
  targetDate?: Date | null;
}

const isBlank = (v: unknown) => v === null || v === "";

// Picks and validates the contract fields present in a request body.
export function parseContractFields(body: Record<string, unknown>): { data: ContractFields; error?: string } {
  const data: ContractFields = {};

  if (body.contractedSpaces !== undefined) {
    const n = isBlank(body.contractedSpaces) ? null : Number(body.contractedSpaces);
    if (n !== null && (!Number.isInteger(n) || n < 0)) return { data, error: "Contracted spaces must be a whole number" };
    data.contractedSpaces = n;
  }

  if (body.revisionsPerSpace !== undefined && !isBlank(body.revisionsPerSpace)) {
    const n = Number(body.revisionsPerSpace);
    if (!Number.isInteger(n) || n < 0) return { data, error: "Revisions per space must be a whole number" };
    data.revisionsPerSpace = n;
  }

  if (body.contractValue !== undefined) {
    const n = isBlank(body.contractValue) ? null : Number(body.contractValue);
    if (n !== null && (!Number.isFinite(n) || n < 0)) return { data, error: "Contract value must be a positive number" };
    data.contractValue = n;
  }

  if (body.currency !== undefined && !isBlank(body.currency)) {
    const c = String(body.currency).trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) return { data, error: "Currency must be a 3-letter code, e.g. USD" };
    data.currency = c;
  }

  if (body.targetDate !== undefined) {
    const d = isBlank(body.targetDate) ? null : new Date(String(body.targetDate));
    if (d && isNaN(d.getTime())) return { data, error: "Invalid target date" };
    data.targetDate = d;
  }

  return { data };
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
