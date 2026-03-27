"use client";

import { Database } from "@/types/supabase";

type WalletTransaction =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
}

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <p className="text-gray-500">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex justify-between items-center p-4 border border-[#e9e9e9] rounded-lg"
          >
            <div>
              <p className="font-medium capitalize">
                {tx.transaction_type.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-gray-500">
                {tx.description || "No description"}
              </p>
              <p className="text-xs text-gray-400">
                {tx.created_at
                  ? new Date(tx.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${tx.transaction_type === "funding" || tx.transaction_type === "booking_receipt" || tx.transaction_type === "simulation" ? "text-green-600" : "text-red-600"}`}
              >
                {tx.transaction_type === "funding" ||
                tx.transaction_type === "booking_receipt" ||
                tx.transaction_type === "simulation"
                  ? "+"
                  : "-"}
                {tx.amount.toFixed(2)}
              </p>
              <p
                className={`text-xs px-2 py-1 rounded-full inline-block ${
                  tx.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : tx.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {tx.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
