"use client";

import { RefreshCw, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Database } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";

type Ledger = Database["public"]["Tables"]["ledger"]["Row"];

export default function MednetWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [ledgerEntries, setLedgerEntries] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[DEBUG CLIENT] MednetWallet page: Component mounted, loading data...');
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    console.log('[DEBUG CLIENT] MednetWallet page: loadWalletData called');
    try {
      setLoading(true);

      // Load Mednet wallet balance from API
      console.log('[DEBUG CLIENT] MednetWallet page: Fetching balance...');
      const balanceResponse = await fetch("/api/mednet-wallet/balance");
      console.log('[DEBUG CLIENT] MednetWallet page: Balance response:', balanceResponse.status, balanceResponse.ok);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        console.log('[DEBUG CLIENT] MednetWallet page: Balance data:', balanceData);
        setBalance(balanceData.balance || 0);
      }

      // Load Mednet ledger entries from API
      console.log('[DEBUG CLIENT] MednetWallet page: Fetching ledger entries...');
      const ledgerResponse = await fetch("/api/mednet-wallet/ledger?limit=50");
      console.log('[DEBUG CLIENT] MednetWallet page: Ledger response:', ledgerResponse.status, ledgerResponse.ok);
      if (ledgerResponse.ok) {
        const ledgerData = await ledgerResponse.json();
        console.log('[DEBUG CLIENT] MednetWallet page: Ledger data:', ledgerData);
        setLedgerEntries(ledgerData.entries || []);
      }
    } catch (error) {
      console.error("[DEBUG CLIENT] MednetWallet page: Error loading Mednet wallet data:", error);
    } finally {
      console.log('[DEBUG CLIENT] MednetWallet page: Loading complete');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('[DEBUG CLIENT] MednetWallet page: Refresh button clicked');
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        <p className="text-lg font-medium">Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mednet Wallet
          </h1>
          <p className="text-gray-600">
            Manage your funds and view transaction history
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={32} className="opacity-80" />
          <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
        </div>
        <p className="text-5xl font-bold mb-2">₦{balance.toFixed(2)}</p>
        <p className="text-sm opacity-75">
          Available for bookings and payments
        </p>
      </div>

      {/* Ledger History */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Ledger History</h2>
        {!ledgerEntries || ledgerEntries.length === 0 ? (
          <p className="text-gray-500">No ledger entries yet.</p>
        ) : (
          <div className="space-y-3">
            {ledgerEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-4 border border-[#e9e9e9] rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">
                    {entry.entry_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      entry.entry_type === "credit" ||
                      entry.entry_type === "refund"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.entry_type === "credit" ||
                    entry.entry_type === "refund"
                      ? "+"
                      : "-"}
                    {entry.amount.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs px-2 py-1 rounded-full inline-block ${
                      entry.entry_type === "credit"
                        ? "bg-green-100 text-green-700"
                        : entry.entry_type === "debit"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {entry.entry_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
