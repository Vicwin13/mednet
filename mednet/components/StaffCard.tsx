import { Database } from "@/types/supabase";
import React from "react";

export type Staff = Database["public"]["Tables"]["staff"]["Row"];

interface StaffCardProps {
  staff: Staff;
}

export default function StaffCard({ staff }: StaffCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg">{staff.full_name}</h3>
      <p className="text-gray-600">{staff.role}</p>
      <p className="text-sm text-gray-500">{staff.department}</p>
      <div className="mt-3 pt-3 border-t">
        <p className="text-sm text-gray-600">{staff.email}</p>
        {staff.phone && (
          <p className="text-sm text-gray-600">{staff.phone.toString()}</p>
        )}
      </div>
    </div>
  );
}
