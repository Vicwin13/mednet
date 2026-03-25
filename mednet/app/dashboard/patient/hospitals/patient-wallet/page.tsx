"use client";

import { useEffect, useState } from "react";

import { Database } from "@/types/supabase";
import { fetchWallet } from "@/lib/fetchWallet";
import { useAuth } from "@/context/AuthContext";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];

export default function PatientWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchWallet(user.id).then(setWallet).catch(console.error);
  }, [user]);

  if (!wallet) <p>Loading ...</p>;

  return (
    <>
      <p>Wallet Address</p>
      {wallet?.balance}
    </>
  );
}
