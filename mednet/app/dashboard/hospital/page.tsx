"use client";

import ConfirmModal, { ModalType } from "@/components/ui/ConfirmModal";
import RequestCard, {
  RequestCardProps,
} from "@/components/hospital/RequestCard";
import { useEffect, useState } from "react";

import AssignStaffModal from "@/components/hospital/AssignStaffModal";
import { Database } from "@/types/supabase";
import type { Staff } from "@/components/StaffCard";
import { fetchStaffs } from "@/lib/staffService";
import { useAuth } from "@/context/AuthContext";

type BookingWithDetails = Database["public"]["Tables"]["bookings"]["Row"] & {
  patient?: Database["public"]["Tables"]["profiles"]["Row"];
  transaction?: Database["public"]["Tables"]["transactions"]["Row"];
};

export default function Requests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [assigningStaff, setAssigningStaff] = useState(false);

  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Fetch requests on component mount - only when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      loadRequests();
    }
    loadStaff();
  }, [profile?.id]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("supabase_token");

      const response = await fetch(
        `/api/bookings/hospital-requests?hospitalId=${profile?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch requests");
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staff = await fetchStaffs();
      setStaffList(staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("supabase_token");

      const response = await fetch("/api/bookings/accept-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept request");
      }

      // Open staff assignment modal
      setSelectedBookingId(bookingId);
      setAssignModalOpen(true);

      // Refresh requests
      loadRequests();
    } catch (err) {
      console.error("Error accepting request:", err);
      setError(err instanceof Error ? err.message : "Failed to accept request");
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    setConfirmModalConfig({
      type: "confirm",
      title: "Reject Request",
      message:
        "Are you sure you want to reject this request? The patient will be refunded.",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("supabase_token");

          const response = await fetch("/api/bookings/reject-request", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to reject request");
          }

          // Refresh requests
          loadRequests();
        } catch (err) {
          console.error("Error rejecting request:", err);
          setError(
            err instanceof Error ? err.message : "Failed to reject request",
          );
        }
      },
    });
    setConfirmModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedBookingId || selectedStaffIds.length === 0) return;

    try {
      setAssigningStaff(true);
      const token = localStorage.getItem("supabase_token");

      const response = await fetch("/api/bookings/assign-staff", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          staffIds: selectedStaffIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign staff");
      }

      // Close modal and refresh
      setAssignModalOpen(false);
      setSelectedBookingId(null);
      setSelectedStaffIds([]);
      loadRequests();
      loadStaff(); // Refresh staff to show updated status
    } catch (err) {
      console.error("Error assigning staff:", err);
      setError(err instanceof Error ? err.message : "Failed to assign staff");
    } finally {
      setAssigningStaff(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Consultant Requests</h1>
          <p className="text-gray-600">
            Manage new patient inquiries and assign specialists.
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        /* Empty state */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500">No requests yet</p>
        </div>
      ) : (
        /* Request cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              booking={request}
              patient={request.patient}
              transaction={request.transaction}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onAssignStaff={(bookingId) => {
                setSelectedBookingId(bookingId);
                setAssignModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Assign Staff Modal */}
      <AssignStaffModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedBookingId(null);
          setSelectedStaffIds([]);
        }}
        staffList={staffList}
        selectedStaffIds={selectedStaffIds}
        onStaffSelectionChange={setSelectedStaffIds}
        onAssign={handleAssignStaff}
        isLoading={assigningStaff}
      />

      {/* Confirmation Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmModalConfig.onConfirm}
          type={confirmModalConfig.type}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
        />
      )}
    </div>
  );
}
