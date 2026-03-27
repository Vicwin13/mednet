"use client";

import React, { useEffect, useState } from "react";
import StaffCard, { Staff } from "@/components/StaffCard";
import {
  createStaff,
  fetchStaffs,
  subscribeToStaffChanges,
} from "@/lib/staffService";

import AddStaffModal from "@/components/AddStaffModal";
import { Database } from "@/types/supabase";
import { getSupabaseClient } from "@/lib/supabase";

type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"];

export default function Staffs() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staffs on component mount
  useEffect(() => {
    loadStaffs();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = subscribeToStaffChanges({
      onInsert: (newStaff) => {
        setStaffs((prev) => [newStaff, ...prev]);
      },
      onUpdate: (updatedStaff) => {
        setStaffs((prev) =>
          prev.map((staff) =>
            staff.id === updatedStaff.id ? updatedStaff : staff,
          ),
        );
      },
      onDelete: (deletedId) => {
        setStaffs((prev) => prev.filter((staff) => staff.id !== deletedId));
      },
    });

    // Cleanup subscription on unmount
    return () => {
      const supabase = getSupabaseClient();
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStaffs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStaffs();
      setStaffs(data);
    } catch (err) {
      console.error("Error fetching staffs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load staff members",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (
    newStaff: Omit<StaffInsert, "id" | "hospital_id" | "created_at">,
  ) => {
    try {
      setError(null);
      await createStaff(newStaff);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding staff:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add staff member",
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staff Directory</h1>
          <p className="text-gray-600">
            Manage clinical resources, oversee departmental availability, and
            update specialized credentials across the MedConnect health system.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Staff
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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
      ) : staffs.length === 0 ? (
        /* Empty state */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No staff members yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Staff
          </button>
        </div>
      ) : (
        /* Staff cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffs.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      )}

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStaff={handleAddStaff}
      />
    </div>
  );
}
