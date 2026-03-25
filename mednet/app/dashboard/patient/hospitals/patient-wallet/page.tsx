"use client";

import { useEffect, useState } from "react";

import AuthProtected from "@/components/AuthProtected";
import { CirclePlus } from "lucide-react";
import { Database } from "@/types/supabase";
import FundWalletModal from "@/components/wallet/FundWalletModal";
import { fetchWallet } from "@/lib/fetchWallet";
import { useAuth } from "@/context/AuthContext";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

export default function PatientWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchWallet(user.id).then(setWallet).catch(console.error);
  }, [user]);

  const handlePaymentSuccess = () => {
    // Refresh wallet data after successful payment
    if (user) {
      fetchWallet(user.id).then(setWallet).catch(console.error);
    }
  };

  if (!wallet) <p>Loading ...</p>;

  return (
    <AuthProtected allowedRoles={["patient"]} redirectTo="">
      <>
        <div className="bg-blue-600 px-10 py-4 w-sm m-3 rounded-xl text-white ">
          <h1 className="text-lg font-light mb-4 uppercase">Current Balance</h1>
          <p className="text-white font-bold text-4xl pb-8">
            {" "}
            {wallet?.currency}
            {wallet?.balance}.00
          </p>
          <button
            onClick={() => setIsFundModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-md hover:bg-amber-50 cursor-pointer bg-white text-blue-600 font-bold  py-2.5 px-3"
          >
            <CirclePlus /> Fund Wallet
          </button>
        </div>
        <FundWalletModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </>
    </AuthProtected>
  if (!wallet) <p>Loading ...</p>;

  return (
    <>
      <p>Wallet Address</p>
      {wallet?.balance}
    </>
  );
}
