"use client";

import { ArrowLeft } from "lucide-react";
import Header from "@/components/patient/Header";
import Link from "next/link";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="pt-16 min-h-screen">
        <div className="p-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
