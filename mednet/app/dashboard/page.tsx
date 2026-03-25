"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "patient") {
        router.replace("/dashboard/patient");
      } else if (profile.role === "hospital") {
        router.replace("/dashboard/hospital");
      }
    }
  }, [profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}
