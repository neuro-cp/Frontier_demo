"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type AuthSessionContextValue = {
  isSupabaseConfigured: boolean;
  user: User | null;
};

const AuthSessionContext =
  createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const isSupabaseConfigured = Boolean(getSupabasePublicEnv());
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const value = useMemo(
    () => ({
      isSupabaseConfigured,
      user,
    }),
    [isSupabaseConfigured, user]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession must be used inside AuthSessionProvider"
    );
  }

  return context;
}
