import React, { useState } from "react";

import { Database } from "@/types/supabase";
import { createPortal } from "react-dom";

// type Staff = Database["public"]["Tables"]["staff"]["Row"];
type StaffInsert = Database["public"]["Tables"]["staff"]["Insert"];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (
    staff: Omit<StaffInsert, "id" | "hospital_id" | "created_at">,
  ) => void;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  onAddStaff,
}: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStaff({
      full_name: formData.full_name,
      role: formData.role,
      department: formData.department,
      email: formData.email,
      phone: formData.phone ? parseInt(formData.phone, 10) : null,
    });
    setFormData({
      full_name: "",
      role: "",
      department: "",
      email: "",
      phone: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full border border-[#bbb] rounded-md p-2"
              placeholder="Enter staff name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full border border-[#bbb] rounded-md p-2"
            >
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              required
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full border border-[#bbb] rounded-md p-2"
            >
              <option value="">Select Department</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Adult Care">Adult Care</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-[#bbb] rounded-md p-2"
              placeholder="staff@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-[#bbb] rounded-md p-2"
              placeholder="+2349036673387"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 cursor-pointer border border-[#bbb] rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
