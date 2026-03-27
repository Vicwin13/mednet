"use client";

import { ArrowDownToLine, CirclePlus, DollarSign } from "lucide-react";

import { Database } from "@/types/supabase";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

interface WalletCardProps {
  wallet: Wallet;
  userRole: "patient" | "hospital";
  onSimulateClick?: () => void;
  onWithdrawClick?: () => void;
}

export default function WalletCard({
  wallet,
  userRole,
  onSimulateClick,
  onWithdrawClick,
}: WalletCardProps) {
  return (
    <div className="bg-blue-600 px-10 py-6 w-sm m-3 rounded-xl text-white">
      <h1 className="text-lg font-light mb-4 uppercase">Current Balance</h1>
      <p className="text-white font-bold text-4xl pb-8">
        {wallet?.currency}
        {wallet?.balance?.toFixed(2) || "0.00"}
      </p>

      <div className="flex gap-3">
        {/* Simulate button - Patients only */}
        {userRole === "patient" && onSimulateClick && (
          <button
            onClick={onSimulateClick}
            className="flex items-center justify-center gap-2 rounded-md hover:bg-amber-50 cursor-pointer bg-white text-blue-600 font-bold py-2.5 px-3"
          >
            <DollarSign size={20} /> Simulate Funding
          </button>
        )}

        {/* Withdraw button - Hospitals only */}
        {userRole === "hospital" && onWithdrawClick && (
          <button
            onClick={onWithdrawClick}
            className="flex items-center justify-center gap-2 rounded-md hover:bg-amber-50 cursor-pointer bg-white text-blue-600 font-bold py-2.5 px-3"
          >
            <ArrowDownToLine size={20} /> Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
