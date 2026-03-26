"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface WithdrawWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawSuccess: () => void;
}

export default function WithdrawWalletModal({
  isOpen,
  onClose,
  onWithdrawSuccess,
}: WithdrawWalletModalProps) {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement withdrawal logic
      // This would call an API route to process the withdrawal
      console.log("Withdrawal request:", { amount, bankAccount });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onWithdrawSuccess();
      onClose();
      setAmount("");
      setBankAccount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Withdraw Funds</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (NGN)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              required
              min="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum withdrawal: ₦1,000.00
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select bank account</option>
              <option value="acc1">GTBank - 01234567890 - John Doe</option>
              {/* TODO: Load user's bank accounts from API */}
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Withdrawals are processed within 1-3
              business days.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
