"use client";

import { Loader2, X } from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface SimulateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSuccess: () => void;
}

export default function SimulateWalletModal({
  isOpen,
  onClose,
  onSimulateSuccess,
}: SimulateWalletModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Simulated wallet funding");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSimulate = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in to simulate wallet funding");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to simulate wallet funding");
      }

      toast.success("Simulated funding successful!");
      onSimulateSuccess();
      onClose();
      setAmount("");
      setDescription("Simulated wallet funding");
    } catch (error) {
      console.error("Simulate funding error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to simulate wallet funding. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Simulate Wallet Funding
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount (NGN)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              "Simulate Funding"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
