import { NextResponse } from "next/server";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, fullName, phone, currentClass, role = "student" } = body;

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (isVpsApiEnabled()) {
    try {
      const { data, error } = await api.auth.register({
        email,
        password,
        fullName,
        phone,
        currentClass,
        role,
      });

      if (!error && data?.user) {
        return NextResponse.json({ user: data.user });
      }
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Registration service unavailable" }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Registration service not available" }, { status: 503 });
}
