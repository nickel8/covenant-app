import { NextRequest, NextResponse } from "next/server";

const ROLES = [
  "landlord", "tenant", "landlord-solicitor",
  "tenant-solicitor", "ll-agent", "t-agent",
] as const;
type Role = typeof ROLES[number];

function regexParse(text: string): { name: string; contact: string; role: Role; email: string } {
  const email = (text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/) ?? [])[0] ?? "";
  const fromM = text.match(/^([\w\s'.]+?)\s+from\s+([\w\s&.,]+?)(?:\s+acting|\s+as\b|,|$)/i);
  const name    = fromM?.[1]?.trim() ?? "";
  const contact = fromM?.[2]?.trim() ?? "";

  const low = text.toLowerCase();
  let role: Role = "tenant";
  if ((low.includes("landlord") || low.includes("owner")) && low.includes("solicit")) {
    role = "landlord-solicitor";
  } else if ((low.includes("tenant") || low.includes("occupier")) && low.includes("solicit")) {
    role = "tenant-solicitor";
  } else if ((low.includes("landlord") || low.includes("ll")) && low.includes("agent")) {
    role = "ll-agent";
  } else if ((low.includes("tenant") || low.includes("t ")) && low.includes("agent")) {
    role = "t-agent";
  } else if (low.includes("landlord") || low.includes("owner")) {
    role = "landlord";
  }

  return { name, contact, role, email };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json(regexParse(text));

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: `Extract the party from this description. Return ONLY valid JSON with these fields:
{"name":"","contact":"","role":"","email":""}

Role must be one of: landlord, tenant, landlord-solicitor, tenant-solicitor, ll-agent, t-agent
- solicitor acting for the landlord/owner → landlord-solicitor
- solicitor acting for the tenant/occupier → tenant-solicitor
- agent acting for the landlord → ll-agent
- agent acting for the tenant → t-agent
"from X" → contact = X (the organisation)
Return only the JSON object, no markdown, no explanation.`,
      messages: [{ role: "user", content: text }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const clean = raw.replace(/```[a-z]*/gi, "").replace(/```/g, "").trim();
    const json = JSON.parse(clean);

    return NextResponse.json({
      name:    String(json.name    ?? ""),
      contact: String(json.contact ?? ""),
      role:    ROLES.includes(json.role) ? (json.role as Role) : "tenant",
      email:   String(json.email   ?? ""),
    });
  } catch {
    return NextResponse.json(regexParse(text));
  }
}
