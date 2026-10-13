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

  return NextResponse.json(regexParse(text));
}
