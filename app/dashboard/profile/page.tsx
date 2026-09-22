import { createServerClient } from "@/lib/supabase/server";
import PasswordUpdateForm from "./PasswordUpdateForm";

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const role =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    "student";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="font-bold text-gray-900">{user?.user_metadata?.full_name || user?.email}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className="mt-4 text-sm text-gray-600">Role: {role}</p>
      </div>

      <PasswordUpdateForm />
    </div>
  );
}
