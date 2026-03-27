"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import ConfirmModal, { ModalType } from "@/components/ui/ConfirmModal";
import { useEffect, useState } from "react";

import { Database } from "@/types/supabase";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

type BookingWithDetails = Database["public"]["Tables"]["bookings"]["Row"] & {
  hospitals?: {
    id: string;
    name: string;
    location: string | null;
    image: string | null;
    fee: string | null;
  } | null;
};

// type BookingStatus =
//   | "none"
//   | "pending"
//   | "accepted"
//   | "assigned"
//   | "rejected"
//   | "completed";

export default function PatientAppointments() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/bookings/patient-bookings?patientId=${user.id}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmServices = async (bookingId: string) => {
    setModalConfig({
      type: "confirm",
      title: "Confirm Services",
      message:
        "Are you sure you want to confirm that services have been rendered? This will release payment to the hospital.",
      onConfirm: async () => {
        try {
          setConfirming(bookingId);

          const response = await fetch("/api/bookings/confirm-services", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to reject services");
          }

          // Refresh bookings
          await loadBookings();
          setModalConfig({
            type: "success",
            title: "Services Confirmed",
            message: "Payment has been released to the hospital.",
          });
          setModalOpen(true);
        } catch (err) {
          console.error("Error rejecting services:", err);
          setModalConfig({
            type: "error",
            title: "Error",
            message:
              err instanceof Error ? err.message : "Failed to reject services",
          });
          setModalOpen(true);
        } finally {
          setConfirming(null);
        }
      },
    });
    setModalOpen(true);
  };
  const handleRejectServices = async (bookingId: string) => {
    setModalConfig({
      type: "confirm",
      title: "Reject Services",
      message:
        "Are you sure you want to reject this service? You will be refunded.",
      onConfirm: async () => {
        try {
          setRejecting(bookingId);
          const response = await fetch("/api/bookings/reject-services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to reject services");
          }
          await loadBookings();
          setModalConfig({
            type: "success",
            title: "Services Rejected",
            message: "Services rejected and refund processed.",
          });
          setModalOpen(true);
        } catch (err) {
          setModalConfig({
            type: "error",
            title: "Error",
            message:
              err instanceof Error ? err.message : "Failed to reject services",
          });
          setModalOpen(true);
        } finally {
          setRejecting(null);
        }
      },
    });
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={14} /> Pending
          </span>
        );
      case "accepted":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle size={14} /> Accepted
          </span>
        );
      case "assigned":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <User size={14} /> Staff Assigned
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} /> Rejected
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} /> Completed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p className="text-lg font-medium">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-600">
          View and manage your medical appointments
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {!loading && bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Appointments Yet
          </h2>
          <p className="text-gray-600">
            {`You haven't booked any appointments yet. Start by browsing hospitals
            and booking your first appointment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                {/* Hospital Image */}
                <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={booking.hospitals?.image || "/images/hospital1.jpg"}
                    alt={booking.hospitals?.name || "Hospital"}
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {booking.hospitals?.name || "Unknown Hospital"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} />
                        <span className="truncate">
                          {booking.hospitals?.location || "Unknown location"}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(booking.status || "none")}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{booking.preferred_date || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{booking.preferred_time || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Fee:</span> ₦
                      {booking.fee || "0"}
                    </div>

                    {booking.status === "assigned" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmServices(booking.id)}
                          disabled={confirming === booking.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {confirming === booking.id
                            ? "Confirming..."
                            : "Confirm Services"}
                        </button>
                        <button
                          onClick={() => handleRejectServices(booking.id)}
                          disabled={rejecting === booking.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {rejecting === booking.id
                            ? "Rejecting..."
                            : "Reject Services"}
                        </button>
                      </div>
                    )}

                    {booking.status === "completed" && (
                      <span className="text-sm text-green-600 font-medium">
                        Payment released to hospital
                      </span>
                    )}

                    {booking.status === "rejected" && (
                      <span className="text-sm text-red-600 font-medium">
                        Refunded to your wallet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalConfig && (
        <ConfirmModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={modalConfig.onConfirm}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
        />
      )}
    </div>
  );
}
