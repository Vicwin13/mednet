import { Calendar, Check, Clock, CreditCard, User, X } from "lucide-react";

import { Database } from "@/types/supabase";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export interface RequestCardProps {
  booking: Booking;
  patient?: Profile;
  transaction?: Transaction;
  onAccept: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onAssignStaff?: (bookingId: string) => void;
}

export default function RequestCard({
  booking,
  patient,
  transaction,
  onAccept,
  onReject,
  onAssignStaff,
}: RequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatAmount = (amount: number) => {
    return `₦${amount?.toLocaleString() || "0"}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header with status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {patient?.firstname} {patient?.lastname}
            </h3>
            <p className="text-sm text-gray-500">Patient ID: {patient?.id}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status || "pending")}`}
        >
          {booking.status?.toUpperCase() || "PENDING"}
        </span>
      </div>

      {/* Booking Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span>Preferred Date: {formatDate(booking.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span>Created: {formatDate(booking.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard size={16} className="text-gray-400" />
          <span className="font-semibold">
            Amount: {formatAmount(booking.fee || 0)}
          </span>
        </div>
        {transaction?.transaction_ref && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">Reference:</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {transaction.transaction_ref}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {booking.status === "pending" && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => onReject(booking.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
          >
            <X size={16} />
            Reject
          </button>
          <button
            onClick={() => onAccept(booking.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            <Check size={16} />
            Accept
          </button>
        </div>
      )}

      {booking.status === "accepted" && onAssignStaff && (
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => onAssignStaff(booking.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            Assign Staff
          </button>
        </div>
      )}

      {booking.status === "assigned" && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg py-2.5">
            <Check size={16} className="inline-block text-green-600 mr-2" />
            Staff assigned - Waiting for service completion
          </div>
        </div>
      )}

      {booking.status === "rejected" && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-center text-sm text-red-600 bg-red-50 rounded-lg py-2.5">
            <X size={16} className="inline-block mr-2" />
            Request rejected - Patient refunded
          </div>
        </div>
      )}

      {booking.status === "completed" && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-center text-sm text-green-600 bg-green-50 rounded-lg py-2.5">
            <Check size={16} className="inline-block mr-2" />
            Services completed - Payment released
          </div>
        </div>
      )}
    </div>
  );
}
