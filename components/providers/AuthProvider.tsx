"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/auth/roles";
import type { Profile } from "@/types";
import { api } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function fetchVpsProfile() {
      const { data, error } = await api.auth.getMe();
      if (!active) return;
      if (!error && data?.authenticated) {
        setUser(data.user);
        setProfile(data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchVpsProfile();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (session) {
        setLoading(true);
        fetchVpsProfile();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Fastify logout is no longer necessary as it's stateless via Supabase JWT
    // but we can call it if we want to clear legacy cookies. We won't.
    setUser(null);
    setProfile(null);
    setLoading(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
