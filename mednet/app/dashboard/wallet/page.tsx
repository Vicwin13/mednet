"use client";

import { useEffect, useState } from "react";

import { Database } from "@/types/supabase";
import SimulateWalletModal from "@/components/wallet/SimulateWalletModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import WalletCard from "@/components/wallet/WalletCard";
import WithdrawWalletModal from "@/components/wallet/WithdrawWalletModal";
import { useAuth } from "@/context/AuthContext";

type WalletTransaction =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [wallet, setWallet] = useState<
    Database["public"]["Tables"]["wallets"]["Row"] | null
  >(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadWalletData() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/wallet/balance?userId=${user.id}`);
        const balanceData = await response.json();
        setWallet(balanceData.wallet);

        const txResponse = await fetch(
          `/api/wallet/transactions?userId=${user.id}`,
        );
        const txData = await txResponse.json();
        setTransactions(txData.transactions);
      } catch (error) {
        console.error("Error loading wallet:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWalletData();
  }, [user]);

  const handleTransactionSuccess = () => {
    // Refresh wallet data after successful transaction
    if (user?.id) {
      fetch(`/api/wallet/balance?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setWallet(data.wallet));
      fetch(`/api/wallet/transactions?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setTransactions(data.transactions));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-xl mb-6 w-sm"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2">Wallet Not Found</h2>
          <p className="text-gray-600 mb-4">
            Your wallet could not be found. Please contact support or try
            refreshing page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || "patient";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {userRole === "patient" ? "My Wallet" : "Hospital Wallet"}
      </h1>

      <div className="space-y-6">
        <WalletCard
          wallet={wallet}
          userRole={userRole}
          onSimulateClick={() => setIsSimulateModalOpen(true)}
          onWithdrawClick={() => setIsWithdrawModalOpen(true)}
        />

        <TransactionHistory transactions={transactions} />
      </div>

      {/* Patient: Simulate Modal */}
      {userRole === "patient" && (
        <SimulateWalletModal
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
          onSimulateSuccess={handleTransactionSuccess}
        />
      )}

      {/* Hospital: Withdraw Modal */}
      {userRole === "hospital" && (
        <WithdrawWalletModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdrawSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}
