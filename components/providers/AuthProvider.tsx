"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

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
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile((data as Profile | null) ?? null);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      // Progressive Migration: If VPS API enabled, try it first
      if (isVpsApiEnabled()) {
        try {
          const { data, error } = await api.auth.getMe();
          if (!error && data?.authenticated && data.user) {
            if (!active) return;
            setUser({
              id: data.user.id,
              email: data.user.email,
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
        } catch {
          // Fall through to Supabase
        }
      }

      // Supabase fallback (production default)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isVpsApiEnabled()) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase.auth]);

  const handleSignOut = async () => {
    setUser(null);
    setProfile(null);
    window.location.assign("/auth/signout");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
