"use client";

import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

import { getSupabaseClient } from "../lib/supabase";

type Profile = {
  id: string;
  role: "patient" | "hospital";
  firstname: string | null;
  lastname: string | null;
  hospitalname: string | null;
  verified: boolean;
};
type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: {
      role?: string;
      firstName?: string;
      lastName?: string;
      hospitalName?: string;
    },
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = getSupabaseClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!data) return;
    setProfile({
      ...data,
      role: data.role as "patient" | "hospital",
      verified: data.verified ?? false,
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: {
      role?: string;
      firstName?: string;
      lastName?: string;
      hospitalName?: string;
    },
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;

    const user = data.user;
    if (user && data.session) {
      // Profile is automatically created by the database trigger
      // Just fetch it after a short delay to ensure the trigger has fired
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      const currentUser = currentSession?.user ?? null;

      if (currentUser) {
        await fetchProfile(currentUser.id);
      }

      setSession(currentSession);
      setUser(currentUser);
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
        setSession(session);
        setUser(currentUser);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  });

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut, profile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
