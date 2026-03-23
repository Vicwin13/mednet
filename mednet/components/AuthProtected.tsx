"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthProtectedProps = {
  children: React.ReactNode;
  allowedRoles?: ("patient" | "hospital")[];
  redirectTo?: string;
};

export default function AuthProtected({
  children,
  allowedRoles,
  redirectTo = "/",
}: AuthProtectedProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (!profile) return;

    // Redirect if role doesn't match allowed roles
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      router.replace("/");
      return;
    }
  }, [user, profile, loading, router, allowedRoles, redirectTo]);

  // Show loading state while checking auth
  if (loading || (user && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-4xl">Loading...</p>
      </div>
    );
  }

  // Don't render children if not authenticated or role doesn't match
  if (!user) {
    return null;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
