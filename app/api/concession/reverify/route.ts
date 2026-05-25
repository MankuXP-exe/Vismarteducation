import { NextResponse } from "next/server";

const VPS_API = process.env.VPS_API_URL || "http://127.0.0.1:3001";
const API_SECRET = process.env.VPS_API_SECRET || "random_secret_key_123";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { concessionId } = body;
    if (!concessionId) return NextResponse.json({ error: "concessionId required" }, { status: 400 });
    const res = await fetch(`${VPS_API}/concession/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": API_SECRET },
      body: JSON.stringify({ concessionId }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
