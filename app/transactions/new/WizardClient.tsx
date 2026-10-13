"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-context";
import type { Transaction, Party, Milestone, Terms, PartyRole, RaciRole } from "@/lib/types";
import Button from "@/components/Button";
import GanttChart from "@/components/GanttChart";

// ── Party draft ────────────────────────────────────────────

interface PartyDraft {
  id: string;
  name: string;
  contact: string;
  role: PartyRole;
  email: string;
}

// ── Wizard state ──────────────────────────────────────────

interface WizardData {
  parties: PartyDraft[];
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

const ROLE_LABEL: Record<PartyRole, string> = {
  landlord: "Landlord",
  tenant: "Tenant",
  "landlord-solicitor": "LL Solicitor",
  "tenant-solicitor": "T Solicitor",
  "ll-agent": "LL Agent",
  "t-agent": "T Agent",
};

const RACI_TITLE: Record<NonNullable<RaciRole>, string> = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
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

const FIXED_ID = "fixed-ll";

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
    parties: [
      { id: FIXED_ID,        name: "Sam Reid",       contact: "Meridian Capital",          role: "landlord",           email: "sam.reid@meridiancap.co.uk" },
      { id: "init-ll-sol",   name: "Giles Marchant", contact: "Marchant & Co Solicitors",  role: "landlord-solicitor", email: "g.marchant@marchantsolicitors.co.uk" },
      { id: "init-ll-agent", name: "James Okafor",   contact: "Meridian Capital",           role: "ll-agent",           email: "j.okafor@meridiancap.co.uk" },
    ],
    leaseType: "Full repairing and insuring (FRI)",
    term: "5 years",
    commencementDate: "",
    rent: "",
    rentReview: "Upward-only, 3-year review",
    breakClause: "",
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

// ── Party card ────────────────────────────────────────────

function PartyCard({
  party, fixed, onChange, onRemove,
}: {
  party: PartyDraft;
  fixed?: boolean;
  onChange?: (p: PartyDraft) => void;
  onRemove?: () => void;
}) {
  if (fixed) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-sunk border border-border rounded-lg">
        <span className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-brand/10 text-brand">
          {ROLE_LABEL[party.role]}
        </span>
        <span className="text-[14px] font-medium">{party.name}</span>
        <span className="text-[13px] text-muted">{party.contact}</span>
        <span className="ml-auto font-mono text-[10px] text-muted uppercase tracking-wide">you</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <select
          value={party.role}
          onChange={(e) => onChange?.({ ...party, role: e.target.value as PartyRole })}
          className="h-7 px-2 text-[12px] font-mono bg-sunk border border-border rounded focus:outline-none focus:border-brand"
        >
          {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <button
          onClick={onRemove}
          className="text-muted hover:text-red-600 text-[18px] leading-none ml-2 transition-colors"
          title="Remove"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TextInput value={party.name}    onChange={(v) => onChange?.({ ...party, name: v })}    placeholder="Name" />
        <TextInput value={party.contact} onChange={(v) => onChange?.({ ...party, contact: v })} placeholder="Organisation" />
        <div className="col-span-2">
          <TextInput type="email" value={party.email} onChange={(v) => onChange?.({ ...party, email: v })} placeholder="Email (optional)" />
        </div>
      </div>
    </div>
  );
}

// ── Step 1 — Parties ──────────────────────────────────────

function StepParties({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  const [nlText,    setNlText]    = useState("");
  const [parsing,   setParsing]   = useState(false);
  const [parseHint, setParseHint] = useState("");

  async function addParty() {
    if (!nlText.trim()) return;
    setParsing(true);
    setParseHint("");
    try {
      const res = await fetch("/api/parse-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlText }),
      });
      const p = await res.json();
      onChange({
        parties: [...data.parties, {
          id:      `pd-${Date.now()}`,
          name:    p.name    || nlText,
          contact: p.contact || "",
          role:    (p.role as PartyRole) || "tenant",
          email:   p.email   || "",
        }],
      });
      setNlText("");
    } catch {
      setParseHint("Could not parse — an empty card has been added for you to fill in.");
      onChange({
        parties: [...data.parties, { id: `pd-${Date.now()}`, name: "", contact: "", role: "tenant", email: "" }],
      });
      setNlText("");
    } finally {
      setParsing(false);
    }
  }

  function updateParty(updated: PartyDraft) {
    onChange({ parties: data.parties.map((x) => x.id === updated.id ? updated : x) });
  }
  function removeParty(id: string) {
    onChange({ parties: data.parties.filter((x) => x.id !== id) });
  }

  return (
    <div className="flex flex-col gap-3">
      {data.parties.map((p) => (
        <PartyCard
          key={p.id}
          party={p}
          fixed={p.id === FIXED_ID}
          onChange={updateParty}
          onRemove={() => removeParty(p.id)}
        />
      ))}

      {/* NL input */}
      <div className="border border-dashed border-border rounded-lg p-4 bg-sunk/40">
        <label className="font-mono text-[11px] tracking-[0.06em] text-muted uppercase block mb-2">
          Add a party
        </label>
        <div className="flex gap-2">
          <input
            value={nlText}
            onChange={(e) => { setNlText(e.target.value); setParseHint(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParty(); } }}
            placeholder='e.g. "Dan Kell from ABC Ltd acting as the occupier&apos;s solicitor"'
            className="flex-1 h-9 px-3 border border-border rounded text-[14px] bg-surface focus:outline-none focus:border-brand transition-colors"
            disabled={parsing}
          />
          <button
            onClick={addParty}
            disabled={parsing || !nlText.trim()}
            className="h-9 px-4 rounded bg-brand text-white text-[13px] font-medium hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {parsing ? "…" : "Add →"}
          </button>
        </div>
        {parseHint
          ? <p className="text-[12px] text-amber-700 mt-1.5">{parseHint}</p>
          : <p className="text-[12px] text-muted mt-1.5">Describe naturally — Covenant will identify their name, organisation and role.</p>
        }
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

// ── RACI modal ────────────────────────────────────────────

function RaciModal({
  milestoneLabel, raci, onChange, onClose,
}: {
  milestoneLabel: string;
  raci: Record<PartyRole, RaciRole>;
  onChange: (r: Record<PartyRole, RaciRole>) => void;
  onClose: () => void;
}) {
  function toggle(role: PartyRole, letter: NonNullable<RaciRole>) {
    onChange({ ...raci, [role]: raci[role] === letter ? null : letter });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-[16px] mb-0.5">{milestoneLabel}</h3>
        <p className="text-[12px] text-muted mb-5">Click a letter to assign. Click again to clear.</p>

        <div className="flex flex-col gap-3">
          {ALL_ROLES.map((role) => {
            const current = raci[role] ?? null;
            return (
              <div key={role} className="flex items-center justify-between">
                <span className="text-[13px] font-medium w-28 text-ink">{ROLE_LABEL[role]}</span>
                <div className="flex gap-1.5">
                  {(["R", "A", "C", "I"] as NonNullable<RaciRole>[]).map((letter) => (
                    <button
                      key={letter}
                      onClick={() => toggle(role, letter)}
                      title={RACI_TITLE[letter]}
                      className={`w-8 h-8 rounded font-mono text-[11px] font-medium transition-all
                        ${current === letter
                          ? letter === "R" ? "bg-brand text-white shadow-sm" :
                            letter === "A" ? "bg-brand/15 text-brand border border-brand/30" :
                            letter === "C" ? "bg-sunk text-ink border border-ink/20" :
                                            "bg-sunk text-muted border border-border"
                          : "border border-border text-muted hover:border-brand hover:text-brand"
                        }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-[11px] text-muted font-mono">
            R=Responsible · A=Accountable · C=Consulted · I=Informed
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full h-9 bg-brand text-white rounded text-[14px] font-medium hover:bg-brand-hover transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Timeline + RACI ──────────────────────────────

function StepTimeline({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  const [raciMilestone, setRaciMilestone] = useState<string | null>(null);

  const activeMilestone = raciMilestone
    ? MILESTONE_TEMPLATES.find((m) => m.id === raciMilestone)
    : null;

  function updateRaci(milestoneId: string, updated: Record<PartyRole, RaciRole>) {
    onChange({ raci: { ...data.raci, [milestoneId]: updated } });
  }

  // Count milestones with R + A assigned
  const configured = MILESTONE_TEMPLATES.filter((m) => {
    const vals = Object.values(data.raci[m.id] ?? {});
    return vals.includes("R") && vals.includes("A");
  }).length;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted">
            Drag bar edges to set target dates · click a bar to assign RACI
          </p>
          <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
            configured === MILESTONE_TEMPLATES.length
              ? "bg-ok/15 text-ok"
              : configured > 0
              ? "bg-amber-100 text-amber-800"
              : "bg-sunk text-muted"
          }`}>
            {configured}/{MILESTONE_TEMPLATES.length} RACI set
          </span>
        </div>

        {/* Legend */}
        {data.raci && (
          <div className="flex items-center gap-4 text-[11px] text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A6B45] inline-block" />
              R + A assigned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#92400E] inline-block" />
              Partial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-[#888] inline-block" />
              Not configured
            </span>
          </div>
        )}

        <GanttChart
          milestones={MILESTONE_TEMPLATES}
          dates={data.dates}
          raci={data.raci}
          onBarClick={(id) => setRaciMilestone(id)}
          onChange={(dates) => onChange({ dates })}
        />
      </div>

      {activeMilestone && (
        <RaciModal
          milestoneLabel={activeMilestone.label}
          raci={data.raci[activeMilestone.id] ?? ({} as Record<PartyRole, RaciRole>)}
          onChange={(r) => updateRaci(activeMilestone.id, r)}
          onClose={() => setRaciMilestone(null)}
        />
      )}
    </>
  );
}

// ── Wizard shell ──────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Parties" },
  { id: 2, label: "Terms" },
  { id: 3, label: "Timeline" },
];

export default function WizardClient() {
  const router = useRouter();
  const { addTransaction } = useDemo();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);

  function patch(p: Partial<WizardData>) { setData((prev) => ({ ...prev, ...p })); }

  function finish() {
    const now = new Date().toISOString();
    const id  = `txn-${Date.now()}`;

    const parties: Party[] = data.parties.map((p, i) => ({
      id:      `p${i + 1}`,
      name:    p.name,
      contact: p.contact,
      role:    p.role,
      email:   p.email || undefined,
    }));

    const tenant       = data.parties.find((p) => p.role === "tenant");
    const counterparty = tenant?.contact || tenant?.name || "New tenant";

    const milestones: Milestone[] = MILESTONE_TEMPLATES.map((m) => ({
      id:          m.id,
      label:       m.label,
      targetDate:  data.dates[m.id] ?? new Date().toISOString().slice(0, 10),
      status:      "pending" as const,
      owner:       (ALL_ROLES.find((r) => data.raci[m.id]?.[r] === "R") ?? "landlord") as PartyRole,
      raci:        data.raci[m.id] ?? ({} as Record<PartyRole, RaciRole>),
    }));

    const terms: Terms = {
      leaseType:        data.leaseType,
      term:             data.term,
      commencementDate: data.commencementDate || milestones[milestones.length - 1].targetDate,
      rent:             data.rent || "TBC",
      rentReview:       data.rentReview,
      breakClause:      data.breakClause || undefined,
      covenantCheck:    data.covenantCheck,
    };

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

  // Step 1 requires at least one tenant party
  const canProceed = step === 1
    ? data.parties.some((p) => p.role === "tenant" && p.name.trim().length > 0)
    : true;

  const isWide = step === 3;

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-5">
      <div className={`w-full transition-all ${isWide ? "max-w-4xl" : "max-w-2xl"}`}>

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
          {step === 1 && <StepParties  data={data} onChange={patch} />}
          {step === 2 && <StepTerms    data={data} onChange={patch} />}
          {step === 3 && <StepTimeline data={data} onChange={patch} />}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>← Back</Button>
          {step < 3
            ? <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>Continue →</Button>
            : <Button variant="primary" onClick={finish}>Create transaction →</Button>
          }
        </div>

        {step === 1 && !data.parties.some((p) => p.role === "tenant") && (
          <p className="text-center text-[12px] text-muted mt-3">Add a tenant party to continue</p>
        )}
      </div>
    </div>
  );
}
