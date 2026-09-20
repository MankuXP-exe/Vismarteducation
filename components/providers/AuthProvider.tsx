"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/auth/roles";
import type { Profile } from "@/types";
import { api } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const { data, error } = await api.auth.getMe();
        if (!error && data?.authenticated && data.user) {
          if (!active) return;
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            app_metadata: { role: data.user.role },
            user_metadata: {
              full_name: data.profile?.full_name,
              role: data.user.role,
            },
          } as any);
          setProfile(data.profile ?? null);
          setLoading(false);
          return;
        }
      } catch {}

      if (active) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
