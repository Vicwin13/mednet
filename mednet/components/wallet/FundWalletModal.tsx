"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    webpayCheckout?: (request: Record<string, unknown>) => void;
  }
}

export default function FundWalletModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: FundWalletModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { session, profile } = useAuth();

  // Load Interswitch inline checkout script
  useEffect(() => {
    if (isOpen && !scriptLoaded) {
      const script = document.createElement("script");
      script.src = "https://newwebpay.qa.interswitchng.com/inline-checkout.js"; // ← QA/TEST URL
      script.async = true;
      script.onload = () => {
        console.log("Interswitch script loaded"); // ← add this
        setScriptLoaded(true);
      };
      script.onerror = (e) => {
        console.error("Interswitch script failed to load", e); // ← add this
      };
      document.body.appendChild(script);
    }
  }, [isOpen, scriptLoaded]);

  const handleFundWallet = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!session?.access_token) {
      toast.error("Please log in to fund your wallet");
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique transaction reference
      const txnRef = `MN_${session.user.id.substring(0, 8)}_${Date.now()}`;

      // STEP 1: Create transaction BEFORE payment
      const createTransactionResponse = await fetch("/api/create-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          txnRef,
          amount: Number(amount),
        }),
      });

      if (!createTransactionResponse.ok) {
        const errorData = await createTransactionResponse.json();
        console.log("Real error:", errorData);
        throw new Error(errorData.error || "Failed to create transaction");
      }

      // STEP 2: Fix payment callback - don't trust response, always verify on backend
      const paymentCallback = async () => {
        try {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              txnRef,
              amount: Number(amount) * 100,
            }),
          });

          if (verifyResponse.ok) {
            toast.success("Payment successful! Wallet funded.");
            onPaymentSuccess();
            onClose();
            setAmount("");
          } else {
            const errorData = await verifyResponse.json();
            toast.error(
              errorData.error ||
                "Payment verification failed. Please contact support.",
            );
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error(
            "Payment verification failed. Please contact support if amount was deducted.",
          );
        } finally {
          setIsLoading(false);
        }
      };

      // STEP 3: Fix payment request with correct parameter names
      const paymentRequest = {
        merchant_code: "MX275953", // Hardcoded as per feedback
        pay_item_id: "Default_Payable_MX275953",
        txn_ref: txnRef,
        amount: Number(amount) * 100, // Interswitch expects amount in kobo
        currency: 566, // ISO 4217 numeric code for Nigerian Naira (NGN)
        cust_email: session.user.email || "",
        cust_name:
          session.user.user_metadata?.full_name || session.user.email || "",
        site_redirect_url: `${window.location.origin}/dashboard/patient/patient-wallet`,
        onComplete: paymentCallback,
        mode: "TEST", // Change to "LIVE" for production
      };

      console.log("webpayCheckout available:", !!window.webpayCheckout); // ← add this

      // Initiate checkout
      if (window.webpayCheckout) {
        window.webpayCheckout(paymentRequest);
      } else {
        throw new Error("Interswitch checkout not loaded");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Fund Wallet</h2>
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={session?.user.email || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="firstname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              value={profile?.firstname || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="lastname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              value={profile?.lastname || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none"
            />
          </div>

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
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You will be redirected to Interswitch
              secure payment gateway to complete your transaction.
            </p>
          </div>

          <button
            onClick={handleFundWallet}
            disabled={isLoading || !amount || !scriptLoaded}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
