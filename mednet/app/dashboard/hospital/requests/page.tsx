"use client";

export default function Requests() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Consultant Requests</h1>
      <p className="text-gray-600 mb-8">
        Manage new patient inquiries and assign specialists.
      </p>

      {/* Empty state - to be populated later */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-500">No requests yet</p>
      </div>
    </div>
  );
}
