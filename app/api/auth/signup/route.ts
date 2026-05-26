import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, fullName, phone, currentClass, role = "student" } = body;

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      current_class: currentClass,
      role,
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Also insert into profiles table
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      current_class: currentClass,
      role,
    });

  if (profileError) {
    // Cleanup auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ user: data.user });
}
