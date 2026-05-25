import { NextResponse } from "next/server";

const VPS_API = process.env.VPS_API_URL || "https://api.vismartlearningeducation.com";
const API_SECRET = process.env.VPS_API_SECRET || "random_secret_key_123";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${VPS_API}/concession/upload`, {
      method: "POST",
      headers: { "x-api-secret": API_SECRET },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
