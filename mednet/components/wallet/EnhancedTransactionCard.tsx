"use client";

import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Wallet,
} from "lucide-react";

import { Database } from "@/types/supabase";

type WalletTransaction =
  Database["public"]["Tables"]["wallet_transactions"]["Row"];

interface TransactionCardProps {
  transaction: WalletTransaction;
  userName?: string;
  hospitalName?: string;
}

type TransactionDirection = "in" | "out";

export default function TransactionCard({
  transaction,
  userName,
  hospitalName,
}: TransactionCardProps) {
  const getTransactionIcon = () => {
    switch (transaction.transaction_type) {
      case "funding":
        return <Wallet size={16} className="text-green-600" />;
      case "booking_receipt":
        return <Building2 size={16} className="text-green-600" />;
      case "service_payment":
        return <Wallet size={16} className="text-red-600" />;
      case "refund":
        return <ArrowDownRight size={16} className="text-green-600" />;
      default:
        return <Wallet size={16} className="text-gray-500" />;
    }
  };

  const getTransactionLabel = () => {
    switch (transaction.transaction_type) {
      case "funding":
        return "Wallet Funded";
      case "booking_receipt":
        return "Booking Payment";
      case "service_payment":
        return "Service Payment to Hospital";
      case "refund":
        return "Refund to Patient";
      default:
        return transaction.transaction_type.replace(/_/g, " ");
    }
  };

  const getDirection = (): TransactionDirection => {
    // Money IN: funding, booking_receipt, refund
    if (
      ["funding", "booking_receipt", "refund"].includes(
        transaction.transaction_type,
      )
    ) {
      return "in";
    }
    // Money OUT: service_payment
    return "out";
  };

  const getAmountColor = () => {
    const direction = getDirection();
    return direction === "in" ? "text-green-600" : "text-red-600";
  };

  const getAmountPrefix = () => {
    const direction = getDirection();
    return direction === "in" ? "+" : "-";
  };

  const getDestinationInfo = () => {
    const direction = getDirection();

    // Money IN cases
    if (direction === "in") {
      switch (transaction.transaction_type) {
        case "funding":
          return "From Payment Gateway";
        case "booking_receipt":
          return "From Patient Wallet";
        case "refund":
          return "From Mednet Wallet";
        default:
          return null;
      }
    }

    // Money OUT cases
    if (direction === "out") {
      switch (transaction.transaction_type) {
        case "service_payment":
          return hospitalName ? `To ${hospitalName}` : "To Hospital";
        default:
          return null;
      }
    }

    return null;
  };

  const destination = getDestinationInfo();

  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      {/* Left: Transaction Details */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {getTransactionIcon()}
          <div>
            <p className="font-medium text-gray-900">{getTransactionLabel()}</p>
            <p className="text-xs text-gray-500">
              {transaction.created_at
                ? new Date(transaction.created_at).toLocaleString()
                : "Unknown date"}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {transaction.description || "No description available"}
        </p>

        {/* Destination Info */}
        {destination && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Money Flow
            </p>
            <div className="flex items-center gap-2 text-sm">
              {userName && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700">P</span>
                  </div>
                  <span className="text-gray-700">{userName}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">M</span>
                  </div>
                  <span className="text-gray-700">Mednet</span>
                  <ArrowDownRight size={14} className="text-gray-400" />
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-700">H</span>
                  </div>
                  <span className="text-gray-700">
                    {hospitalName || "Hospital"}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-xs">→</span>
                <span>{destination}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Amount */}
      <div className="text-right">
        <p className={`text-2xl font-bold ${getAmountColor()}`}>
          {getAmountPrefix()}
          {transaction.amount.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Balance after: ₦{transaction.balance_after?.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
