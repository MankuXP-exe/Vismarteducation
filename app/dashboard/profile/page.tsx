import { createServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };
  const role =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    profile?.role ||
    "student";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="font-bold text-gray-900">{profile?.full_name || user?.email}</p>
        <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
        <p className="mt-4 text-sm text-gray-600">Role: {role}</p>
      </div>
    </div>
  );
}
