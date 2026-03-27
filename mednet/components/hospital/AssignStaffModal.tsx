import { Check, User, X, XCircle } from "lucide-react";

import { Database } from "@/types/supabase";
import { useState } from "react";

type Staff = Database["public"]["Tables"]["staff"]["Row"];

export interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Staff[];
  selectedStaffIds: string[];
  onStaffSelectionChange: (staffIds: string[]) => void;
  onAssign: () => void;
  isLoading?: boolean;
}

export default function AssignStaffModal({
  isOpen,
  onClose,
  staffList,
  selectedStaffIds,
  onStaffSelectionChange,
  onAssign,
  isLoading = false,
}: AssignStaffModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter staff by search query
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Only show active staff for selection
  const availableStaff = filteredStaff.filter(
    (staff) => staff.active !== false,
  );

  const handleToggleStaff = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      onStaffSelectionChange(selectedStaffIds.filter((id) => id !== staffId));
    } else {
      onStaffSelectionChange([...selectedStaffIds, staffId]);
    }
  };

  const getSelectedStaff = () => {
    return staffList.filter((staff) => selectedStaffIds.includes(staff.id));
  };

  const handleRemoveStaff = (staffId: string) => {
    onStaffSelectionChange(selectedStaffIds.filter((id) => id !== staffId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Staff</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select one or more staff members to handle this booking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Selected Staff Display */}
        {selectedStaffIds.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              SELECTED STAFF ({selectedStaffIds.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {getSelectedStaff().map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {staff.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{staff.role}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveStaff(staff.id)}
                    className="ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <XCircle size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search staff by name, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-4">
          {availableStaff.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No available staff found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableStaff.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleToggleStaff(staff.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedStaffIds.includes(staff.id)
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {staff.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{staff.role}</p>
                      {staff.department && (
                        <p className="text-xs text-gray-500 truncate">
                          {staff.department}
                        </p>
                      )}
                    </div>
                    {selectedStaffIds.includes(staff.id) && (
                      <div className="shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={selectedStaffIds.length === 0 || isLoading}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              selectedStaffIds.length === 0 || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Check size={18} />
                Assign {selectedStaffIds.length} Staff
                {selectedStaffIds.length > 1 ? " Members" : " Member"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
