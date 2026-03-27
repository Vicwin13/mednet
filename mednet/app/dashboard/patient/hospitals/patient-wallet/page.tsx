"use client";

import { CirclePlus, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

import AuthProtected from "@/components/AuthProtected";
import { Database } from "@/types/supabase";
import FundWalletModal from "@/components/wallet/FundWalletModal";
import SimulateWalletModal from "@/components/wallet/SimulateWalletModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import { fetchWallet } from "@/lib/fetchWallet";
import { useAuth } from "@/context/AuthContext";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type WalletTransaction =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

export default function PatientWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load wallet balance
      const walletData = await fetchWallet(user.id);
      setWallet(walletData);

      // Load transactions
      const response = await fetch(
        `/api/wallet/transactions?userId=${user.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh wallet data after successful payment
    loadWalletData();
  };

  const handleSimulateSuccess = () => {
    // Refresh wallet data after successful simulation
    loadWalletData();
  };

  if (loading) {
    return (
      <AuthProtected allowedRoles={["patient"]} redirectTo="/">
        <p>Loading ...</p>
      </AuthProtected>
    );
  }

  if (!wallet) {
    return (
      <AuthProtected allowedRoles={["patient"]} redirectTo="/">
        <p>Wallet not found</p>
      </AuthProtected>
    );
  }

  return (
    <AuthProtected allowedRoles={["patient"]} redirectTo="/">
      <>
        <div className="bg-blue-600 px-10 py-4 w-md m-3 rounded-xl text-white ">
          <h1 className="text-lg font-light mb-4 uppercase">Current Balance</h1>
          <p className="text-white font-bold text-4xl pb-8">
            {" "}
            {wallet?.currency}
            {wallet?.balance}.00
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsFundModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-md hover:bg-amber-50 cursor-pointer bg-white text-blue-600 font-bold  py-2.5 px-3"
            >
              <CirclePlus /> Fund Wallet
            </button>
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-md hover:bg-amber-50 cursor-pointer bg-white text-blue-600 font-bold  py-2.5 px-3"
            >
              <DollarSign size={20} /> Simulate Funding
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} userRole="patient" />

        <FundWalletModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <SimulateWalletModal
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
          onSimulateSuccess={handleSimulateSuccess}
        />
      </>
    </AuthProtected>
  );
}
