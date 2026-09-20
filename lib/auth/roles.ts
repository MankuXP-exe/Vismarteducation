export type User = {
  id: string;
  email?: string;
  role?: string;
  app_metadata?: any;
  user_metadata?: any;
};

type ProfileRole = {
  role?: string | null;
} | null;

export function getEffectiveRole(user: User | null, profile?: ProfileRole) {
  return (
    profile?.role ||
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    "student"
  );
}

export function hasTeacherAccess(user: User | null, profile?: ProfileRole) {
  const role = getEffectiveRole(user, profile);
  return role === "teacher" || role === "admin";
}

export function hasAdminAccess(user: User | null, profile?: ProfileRole) {
  return getEffectiveRole(user, profile) === "admin";
}
