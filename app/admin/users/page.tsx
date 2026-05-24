import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getUsers() {
  if (!isSupabaseAdminConfigured) return [];

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabaseAdmin.from("profiles").select("id,full_name,email,phone,current_class,role,is_active,created_at"),
  ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (authData.users ?? []).map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email ?? profile?.email ?? "",
      name: profile?.full_name || user.user_metadata?.full_name || user.email || "Unnamed user",
      phone: profile?.phone || user.user_metadata?.phone || "",
      role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || "student",
      currentClass: profile?.current_class || user.user_metadata?.current_class || "",
      status: profile?.is_active === false ? "inactive" : "active",
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">All registered auth users and their platform roles.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              {["Name", "Email", "Phone", "Class", "Role", "Status", "Joined"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-gray-700">{user.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{user.currentClass || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{user.role}</td>
                  <td className="px-4 py-3 text-gray-700">{user.status}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
