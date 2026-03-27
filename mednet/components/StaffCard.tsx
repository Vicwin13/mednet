import { CheckCircle, XCircle } from "lucide-react";

import { Database } from "@/types/supabase";
import React from "react";

export type Staff = Database["public"]["Tables"]["staff"]["Row"];

interface StaffCardProps {
  staff: Staff;
}

export default function StaffCard({ staff }: StaffCardProps) {
  const isActive = staff.active !== false;

  return (
    <div
      className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${
        isActive ? "border-gray-200" : "border-gray-300 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{staff.full_name}</h3>
          <p className="text-gray-600">{staff.role}</p>
          <p className="text-sm text-gray-500">{staff.department}</p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {isActive ? (
            <>
              <CheckCircle size={14} />
              Active
            </>
          ) : (
            <>
              <XCircle size={14} />
              Unavailable
            </>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t">
        {staff.email && <p className="text-sm text-gray-600">{staff.email}</p>}
        {staff.phone && (
          <p className="text-sm text-gray-600">{staff.phone.toString()}</p>
        )}
      </div>
    </div>
  );
}
