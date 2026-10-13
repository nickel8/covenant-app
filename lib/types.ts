// ── Core domain types ─────────────────────────────────────

export type TransactionType = "lease" | "acquire" | "sell";
export type MilestoneStatus = "complete" | "in-progress" | "pending" | "late";
export type PartyRole = "landlord" | "tenant" | "landlord-solicitor" | "tenant-solicitor" | "agent";
export type RaciRole = "R" | "A" | "C" | "I" | null;

export interface Party {
  id: string;
  name: string;
  contact: string;
  role: PartyRole;
  email?: string;
  phone?: string;
}

export interface Milestone {
  id: string;
  label: string;
  targetDate: string; // ISO YYYY-MM-DD
  completedDate?: string;
  status: MilestoneStatus;
  owner: PartyRole;
  raci: Record<PartyRole, RaciRole>;
  notes?: string;
}

export interface Terms {
  leaseType: string;
  term: string;
  commencementDate: string;
  rent: string;
  rentReview: string;
  breakClause?: string;
  covenantCheck: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string; // ISO
  type: "milestone" | "chase" | "email" | "ai-detect" | "note" | "created";
  text: string;
  actor?: string;
  actionLabel?: string;
  actionType?: "accept-date" | "dismiss";
  detectedDate?: string; // ISO YYYY-MM-DD — used with ai-detect
  milestoneId?: string;   // used when accepting a detected date
}

export interface Transaction {
  id: string;
  assetId: string;
  unitId: string;
  type: TransactionType;
  counterparty: string;
  status: "in-progress" | "complete" | "stalled";
  currentStage: number; // 1-based index into milestones
  parties: Party[];
  milestones: Milestone[];
  terms: Terms;
  activity: ActivityEvent[];
}

export interface Unit {
  id: string;
  label: string;
  sizeSqFt: number;
  floor?: string;
  tenant?: string;
  status: "vacant" | "leased" | "under-offer";
}

export interface Asset {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  units: Unit[];
}
