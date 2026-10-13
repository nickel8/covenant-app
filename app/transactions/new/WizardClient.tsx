"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import type { Transaction, Party, Milestone, Terms, PartyRole, RaciRole } from "@/lib/types";
import Button from "@/components/Button";
import GanttChart from "@/components/GanttChart";

// ── Wizard state ──────────────────────────────────────────

interface WizardData {
  tenantName: string;
  tenantContact: string;
  tenantEmail: string;
  tenantSolicitorName: string;
  tenantSolicitorFirm: string;
  tenantSolicitorEmail: string;
  leaseType: string;
  term: string;
  commencementDate: string;
  rent: string;
  rentReview: string;
  breakClause: string;
  covenantCheck: boolean;
  dates: Record<string, string>;
  raci: Record<string, Record<PartyRole, RaciRole>>;
}

const MILESTONE_TEMPLATES = [
  { id: "m1", label: "Heads of terms signed" },
  { id: "m2", label: "Solicitors instructed" },
  { id: "m3", label: "Covenant check complete" },
  { id: "m4", label: "Draft lease issued" },
  { id: "m5", label: "Lease negotiation complete" },
  { id: "m6", label: "Lease signed" },
  { id: "m7", label: "Fit-out access granted" },
];

const ALL_ROLES: PartyRole[] = [
  "landlord", "tenant", "landlord-solicitor", "tenant-solicitor", "ll-agent", "t-agent",
];

const ROLE_SHORT: Record<PartyRole, string> = {
  landlord: "Landlord",
  tenant: "Tenant",
  "landlord-solicitor": "LL Sol.",
  "tenant-solicitor": "T Sol.",
  "ll-agent": "LL",
  "t-agent": "T",
};

const DEFAULT_RACI: Record<string, Record<PartyRole, RaciRole>> = {
  m1: { landlord: "A", tenant: "A", "landlord-solicitor": "C", "tenant-solicitor": "C", "ll-agent": "R", "t-agent": "R" },
  m2: { landlord: "R", tenant: "R", "landlord-solicitor": "A", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
  m3: { landlord: "A", tenant: "C", "landlord-solicitor": "R", "tenant-solicitor": "I", "ll-agent": "I", "t-agent": "C" },
  m4: { landlord: "C", tenant: "I", "landlord-solicitor": "R", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
  m5: { landlord: "A", tenant: "A", "landlord-solicitor": "R", "tenant-solicitor": "R", "ll-agent": "C", "t-agent": "C" },
  m6: { landlord: "R", tenant: "R", "landlord-solicitor": "A", "tenant-solicitor": "A", "ll-agent": "I", "t-agent": "I" },
  m7: { landlord: "R", tenant: "A", "landlord-solicitor": "I", "tenant-solicitor": "I", "ll-agent": "C", "t-agent": "A" },
};

function defaultDates() {
  const base = new Date();
  const add = (days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  return { m1: add(0), m2: add(7), m3: add(21), m4: add(35), m5: add(56), m6: add(70), m7: add(77) };
}

function initialData(): WizardData {
  return {
    tenantName: "", tenantContact: "", tenantEmail: "",
    tenantSolicitorName: "", tenantSolicitorFirm: "", tenantSolicitorEmail: "",
    leaseType: "Full repairing and insuring (FRI)",
    term: "5 years", commencementDate: "", rent: "",
    rentReview: "Upward-only, 3-year review", breakClause: "",
    covenantCheck: true,
    dates: defaultDates(),
    raci: DEFAULT_RACI,
  };
}

// ── Shared form primitives ────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[11px] tracking-[0.06em] text-muted uppercase">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="h-9 px-3 border border-border rounded text-[14px] bg-surface focus:outline-none focus:border-brand disabled:bg-sunk disabled:text-muted transition-colors"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 border border-border rounded text-[14px] bg-surface focus:outline-none focus:border-brand transition-colors">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Step 1 — Parties ──────────────────────────────────────

function StepParties({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-semibold text-[14px] mb-3">Landlord</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><TextInput value="Sam Reid" onChange={() => {}} disabled /></Field>
          <Field label="Organisation"><TextInput value="Meridian Capital" onChange={() => {}} disabled /></Field>
        </div>
      </div>
      <div className="border-t border-border" />
      <div>
        <h3 className="font-semibold text-[14px] mb-3">Tenant</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <TextInput value={data.tenantName} onChange={(v) => onChange({ tenantName: v })} placeholder="e.g. Jane Smith" />
          </Field>
          <Field label="Organisation">
            <TextInput value={data.tenantContact} onChange={(v) => onChange({ tenantContact: v })} placeholder="e.g. Acme Ltd" />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={data.tenantEmail} onChange={(v) => onChange({ tenantEmail: v })} placeholder="tenant@company.co.uk" />
          </Field>
        </div>
      </div>
      <div className="border-t border-border" />
      <div>
        <h3 className="font-semibold text-[14px] mb-3">Tenant&apos;s solicitor</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <TextInput value={data.tenantSolicitorName} onChange={(v) => onChange({ tenantSolicitorName: v })} placeholder="e.g. Sarah Jones" />
          </Field>
          <Field label="Firm">
            <TextInput value={data.tenantSolicitorFirm} onChange={(v) => onChange({ tenantSolicitorFirm: v })} placeholder="e.g. Jones & Co" />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={data.tenantSolicitorEmail} onChange={(v) => onChange({ tenantSolicitorEmail: v })} placeholder="solicitor@firm.co.uk" />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Terms ────────────────────────────────────────

function StepTerms({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Lease type">
          <SelectInput value={data.leaseType} onChange={(v) => onChange({ leaseType: v })}
            options={["Full repairing and insuring (FRI)", "Internal repairing and insuring (IRI)", "Internal repairing only (IR)", "Licence to occupy"]} />
        </Field>
        <Field label="Term">
          <SelectInput value={data.term} onChange={(v) => onChange({ term: v })}
            options={["1 year", "2 years", "3 years", "5 years", "10 years", "15 years", "25 years"]} />
        </Field>
        <Field label="Commencement date">
          <TextInput type="date" value={data.commencementDate} onChange={(v) => onChange({ commencementDate: v })} />
        </Field>
        <Field label="Annual rent">
          <TextInput value={data.rent} onChange={(v) => onChange({ rent: v })} placeholder="e.g. £24,000 per annum" />
        </Field>
        <Field label="Rent review">
          <SelectInput value={data.rentReview} onChange={(v) => onChange({ rentReview: v })}
            options={["Upward-only, 3-year review", "Upward-only, 5-year review", "Open market, 3-year review", "RPI-linked", "None"]} />
        </Field>
        <Field label="Break clause (optional)">
          <TextInput value={data.breakClause} onChange={(v) => onChange({ breakClause: v })} placeholder="e.g. Tenant break at year 3" />
        </Field>
      </div>
      <div className="border-t border-border pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.covenantCheck} onChange={(e) => onChange({ covenantCheck: e.target.checked })} className="w-4 h-4 accent-brand" />
          <span className="text-[14px]">Require covenant strength check</span>
        </label>
        <p className="text-[12px] text-muted mt-1 ml-7">Landlord&apos;s solicitor will verify tenant&apos;s financial standing before proceeding.</p>
      </div>
    </div>
  );
}

// ── Step 3 — Timeline (Gantt) ─────────────────────────────

function StepTimeline({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted">
        Drag the right edge of each bar to adjust the target date. Bars span from the previous milestone.
      </p>
      <GanttChart
        milestones={MILESTONE_TEMPLATES}
        dates={data.dates}
        onChange={(dates) => onChange({ dates })}
      />
    </div>
  );
}

// ── Step 4 — RACI ─────────────────────────────────────────

const RACI_OPTIONS: RaciRole[] = ["R", "A", "C", "I", null];
const RACI_TITLE: Record<NonNullable<RaciRole>, string> = { R: "Responsible", A: "Accountable", C: "Consulted", I: "Informed" };

function RaciCell({ value, onChange }: { value: RaciRole; onChange: (v: RaciRole) => void }) {
  const idx = RACI_OPTIONS.indexOf(value);
  function cycle() { onChange(RACI_OPTIONS[(idx + 1) % RACI_OPTIONS.length]); }

  if (!value) return (
    <button onClick={cycle} className="w-7 h-7 rounded border border-dashed border-border hover:border-brand text-muted hover:text-brand text-[11px] font-mono transition-colors">+</button>
  );

  return (
    <button onClick={cycle} title={RACI_TITLE[value]}
      className={`w-7 h-7 rounded font-mono text-[11px] font-medium transition-colors
        ${value === "R" ? "bg-brand text-white hover:bg-brand-hover" :
          value === "A" ? "bg-brand-soft text-brand hover:bg-brand-soft/70" :
          value === "C" ? "bg-sunk text-ink hover:bg-border" :
          "text-muted border border-border hover:bg-sunk"}`}>
      {value}
    </button>
  );
}

function StepRaci({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  function updateRaci(mId: string, role: PartyRole, value: RaciRole) {
    onChange({ raci: { ...data.raci, [mId]: { ...data.raci[mId], [role]: value } } });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted">Click a cell to cycle through R · A · C · I. LL = landlord&apos;s agent, T = tenant&apos;s agent.</p>
      <div className="border border-border rounded-lg overflow-hidden bg-surface overflow-x-auto">
        <table className="w-full text-[12px] min-w-[540px]">
          <thead>
            <tr className="border-b border-border bg-sunk">
              <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase">Milestone</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="px-3 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase text-center">
                  {ROLE_SHORT[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MILESTONE_TEMPLATES.map((m, i) => (
              <tr key={m.id} className={i < MILESTONE_TEMPLATES.length - 1 ? "border-b border-border" : ""}>
                <td className="px-4 py-2.5 font-medium leading-snug">{m.label}</td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="px-3 py-2.5 text-center">
                    <RaciCell value={data.raci[m.id]?.[role] ?? null} onChange={(v) => updateRaci(m.id, role, v)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Wizard shell ──────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Parties" },
  { id: 2, label: "Terms" },
  { id: 3, label: "Timeline" },
  { id: 4, label: "RACI" },
];

export default function WizardClient() {
  const router = useRouter();
  const { addTransaction } = useDemo();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);

  function patch(p: Partial<WizardData>) { setData((prev) => ({ ...prev, ...p })); }

  function finish() {
    const now = new Date().toISOString();
    const id = `txn-${Date.now()}`;

    const parties: Party[] = [
      { id: "p1", name: "Sam Reid", contact: "Meridian Capital", role: "landlord", email: "sam.reid@meridiancap.co.uk" },
      { id: "p2", name: data.tenantName || "Tenant", contact: data.tenantContact || "", role: "tenant", email: data.tenantEmail },
      { id: "p3", name: "Giles Marchant", contact: "Marchant & Co Solicitors", role: "landlord-solicitor" },
      { id: "p4", name: "James Okafor", contact: "Meridian Capital", role: "ll-agent" },
      ...(data.tenantSolicitorName
        ? [{ id: "p5", name: data.tenantSolicitorName, contact: data.tenantSolicitorFirm, role: "tenant-solicitor" as PartyRole, email: data.tenantSolicitorEmail }]
        : []),
    ];

    const milestones: Milestone[] = MILESTONE_TEMPLATES.map((m) => ({
      id: m.id,
      label: m.label,
      targetDate: data.dates[m.id] ?? new Date().toISOString().slice(0, 10),
      status: "pending" as const,
      owner: (ALL_ROLES.find((r) => data.raci[m.id]?.[r] === "R") ?? "landlord") as PartyRole,
      raci: data.raci[m.id] ?? ({} as Record<PartyRole, RaciRole>),
    }));

    const terms: Terms = {
      leaseType: data.leaseType,
      term: data.term,
      commencementDate: data.commencementDate || milestones[milestones.length - 1].targetDate,
      rent: data.rent || "TBC",
      rentReview: data.rentReview,
      breakClause: data.breakClause || undefined,
      covenantCheck: data.covenantCheck,
    };

    const counterparty = data.tenantContact || data.tenantName || "New tenant";

    addTransaction({
      id, assetId: "asset-1", unitId: "u2", type: "lease",
      counterparty, status: "in-progress", currentStage: 1,
      parties, milestones, terms,
      activity: [
        { id: `a1-${Date.now()}`, timestamp: now, type: "created",
          text: `Transaction created — ${counterparty}, Unit 2 lease.`, actor: "Sam Reid" },
        { id: `a2-${Date.now()}`, timestamp: new Date(Date.now() + 5000).toISOString(), type: "email",
          text: `Timeline shared with ${parties.length} parties for review and acceptance.`, actor: "Sam Reid" },
      ],
    } as Transaction);

    router.push(`/transactions/${id}`);
  }

  const canProceed = step === 1 ? data.tenantName.trim().length > 0 : true;
  // Step 3 (Gantt) needs more width
  const isGanttStep = step === 3;

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-5">
      <div className={`w-full transition-all ${isGanttStep ? "max-w-4xl" : "max-w-2xl"}`}>

        <button onClick={() => router.push("/assets/asset-1")}
          className="text-muted text-[13px] hover:text-ink mb-6 flex items-center gap-1 transition-colors">
          ← Back to 12 Mill Lane
        </button>

        <div className="mb-8">
          <h1 className="font-display text-[32px] leading-tight mb-1">New transaction</h1>
          <p className="text-muted text-[14px]">Unit 2 · Lease · 12 Mill Lane</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-0">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-medium transition-colors
                  ${s.id <= step ? "bg-brand text-white" : "bg-sunk text-muted border border-border"}`}>
                  {s.id < step ? "✓" : s.id}
                </div>
                <span className={`text-[11px] font-mono mt-1 tracking-[0.04em] ${s.id === step ? "text-ink" : "text-muted"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-16 mb-4 mx-1 ${s.id < step ? "bg-brand" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[16px] mb-5">{STEPS[step - 1].label}</h2>
          {step === 1 && <StepParties data={data} onChange={patch} />}
          {step === 2 && <StepTerms data={data} onChange={patch} />}
          {step === 3 && <StepTimeline data={data} onChange={patch} />}
          {step === 4 && <StepRaci data={data} onChange={patch} />}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>← Back</Button>
          {step < 4
            ? <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>Continue →</Button>
            : <Button variant="primary" onClick={finish}>Create transaction →</Button>
          }
        </div>
      </div>
    </div>
  );
}
