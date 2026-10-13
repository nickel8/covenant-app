import type { Asset, Transaction } from "./types";

// ── 12 Mill Lane ─────────────────────────────────────────

export const DEMO_ASSET: Asset = {
  id: "asset-1",
  name: "12 Mill Lane",
  address: "12 Mill Lane",
  city: "Leeds",
  postcode: "LS1 5DQ",
  units: [
    { id: "u1", label: "Unit 1", sizeSqFt: 1200, floor: "Ground", tenant: "Fernhill Dental", status: "leased" },
    { id: "u2", label: "Unit 2", sizeSqFt: 850,  floor: "Ground", status: "vacant" },
    { id: "u3", label: "Unit 3", sizeSqFt: 1450, floor: "First",  tenant: "Meridian Wealth", status: "leased" },
    { id: "u4", label: "Unit 4", sizeSqFt: 950,  floor: "First",  status: "under-offer" },
  ],
};

// ── Fernhill Dental — Unit 1 Lease ───────────────────────

export const DEMO_TRANSACTION: Transaction = {
  id: "txn-1",
  assetId: "asset-1",
  unitId: "u1",
  type: "lease",
  counterparty: "Fernhill Dental Ltd",
  status: "in-progress",
  currentStage: 4,
  parties: [
    { id: "p1", name: "Sam Reid",        contact: "Meridian Capital",          role: "landlord",          email: "sam.reid@meridiancap.co.uk" },
    { id: "p2", name: "Dr. Alice Fernhill", contact: "Fernhill Dental Ltd",    role: "tenant",            email: "alice@fernhilldental.co.uk" },
    { id: "p3", name: "Giles Marchant",  contact: "Marchant & Co Solicitors",  role: "landlord-solicitor",email: "g.marchant@marchantsolicitors.co.uk" },
    { id: "p4", name: "Priya Sharma",    contact: "Sharma Legal LLP",          role: "tenant-solicitor",  email: "p.sharma@sharmalegal.co.uk" },
    { id: "p5", name: "James Okafor",    contact: "Meridian Capital",          role: "ll-agent",          email: "j.okafor@meridiancap.co.uk" },
    { id: "p6", name: "Rebecca Nwoke",   contact: "Harper & Co",               role: "t-agent",           email: "r.nwoke@harperandco.co.uk" },
  ],
  milestones: [
    {
      id: "m1", label: "Heads of terms signed",
      targetDate: "2024-09-02", completedDate: "2024-09-02", status: "complete", owner: "ll-agent",
      raci: { landlord: "A", tenant: "A", "landlord-solicitor": "C", "tenant-solicitor": "C", "ll-agent": "R", "t-agent": "R" },
    },
    {
      id: "m2", label: "Solicitors instructed",
      targetDate: "2024-09-09", completedDate: "2024-09-10", status: "complete", owner: "landlord",
      raci: { landlord: "R", tenant: "R", "landlord-solicitor": "A", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
    },
    {
      id: "m3", label: "Covenant check complete",
      targetDate: "2024-09-23", status: "late", owner: "landlord-solicitor",
      raci: { landlord: "A", tenant: "C", "landlord-solicitor": "R", "tenant-solicitor": "I", "ll-agent": "I", "t-agent": "C" },
      notes: "Awaiting financial references from tenant.",
    },
    {
      id: "m4", label: "Draft lease issued",
      targetDate: "2024-10-07", status: "in-progress", owner: "landlord-solicitor",
      raci: { landlord: "C", tenant: "I", "landlord-solicitor": "R", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
    },
    {
      id: "m5", label: "Lease negotiation complete",
      targetDate: "2024-10-28", status: "pending", owner: "landlord-solicitor",
      raci: { landlord: "A", tenant: "A", "landlord-solicitor": "R", "tenant-solicitor": "R", "ll-agent": "C", "t-agent": "C" },
    },
    {
      id: "m6", label: "Lease signed",
      targetDate: "2024-11-11", status: "pending", owner: "landlord",
      raci: { landlord: "R", tenant: "R", "landlord-solicitor": "A", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
    },
    {
      id: "m7", label: "Fit-out access granted",
      targetDate: "2024-11-18", status: "pending", owner: "landlord",
      raci: { landlord: "R", tenant: "A", "landlord-solicitor": "I", "tenant-solicitor": "I", "ll-agent": "C", "t-agent": "A" },
    },
  ],
  terms: {
    leaseType: "Full repairing and insuring (FRI)",
    term: "5 years",
    commencementDate: "2024-12-01",
    rent: "£24,000 per annum",
    rentReview: "Upward-only, 3-year review",
    breakClause: "Tenant break at year 3 with 6 months notice",
    covenantCheck: true,
  },
  activity: [
    { id: "a1", timestamp: "2024-09-02T09:30:00Z", type: "created",   text: "Transaction created — Fernhill Dental Ltd, Unit 1 lease.", actor: "Sam Reid" },
    { id: "a2", timestamp: "2024-09-02T09:35:00Z", type: "email",     text: "Timeline shared with 6 parties for review and acceptance.", actor: "Sam Reid" },
    { id: "a3", timestamp: "2024-09-02T10:12:00Z", type: "milestone", text: "Dr. Alice Fernhill (Fernhill Dental Ltd) accepted the plan.", actor: "Dr. Alice Fernhill" },
    { id: "a4", timestamp: "2024-09-02T11:40:00Z", type: "milestone", text: "James Okafor (Meridian Capital) accepted the plan.", actor: "James Okafor" },
    { id: "a5", timestamp: "2024-09-02T14:15:00Z", type: "milestone", text: "Milestone complete: Heads of terms signed.", actor: "Sam Reid" },
    { id: "a6", timestamp: "2024-09-10T11:00:00Z", type: "milestone", text: "Milestone complete: Solicitors instructed (1 day late).", actor: "Giles Marchant" },
    { id: "a7", timestamp: "2024-09-24T08:45:00Z", type: "chase",     text: "Chased Fernhill Dental Ltd re: Covenant check — financial references outstanding.", actor: "Sam Reid" },
    { id: "a8", timestamp: "2024-10-08T16:20:00Z", type: "email",     text: "Email received from Priya Sharma (Sharma Legal LLP) re: draft lease timeline.", actor: "Priya Sharma" },
    {
      id: "a9", timestamp: "2024-10-09T09:05:00Z", type: "ai-detect",
      text: "Covenant detected a proposed date in Priya Sharma's email: 15 Oct for draft lease.",
      detectedDate: "2024-10-15", milestoneId: "m3", actionLabel: "Update milestone", actionType: "accept-date",
    },
  ],
};

export const ALL_ASSETS = [DEMO_ASSET];
export const ALL_TRANSACTIONS = [DEMO_TRANSACTION];
