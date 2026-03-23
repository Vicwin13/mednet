import { Hospital } from "lucide-react";
import Image from "next/image";
import React from "react";

type RoleToggleProps = {
  role: "patient" | "hospital";
  setRole: (role: "patient" | "hospital") => void;
};

export default function RoleToggle({ role, setRole }: RoleToggleProps) {
  return (
    <div className="flex space-x-4">
      <button
        className={`px-4 py-2 flex justify-center gap-2 items-center w-full rounded-md ${role === "patient" ? "shadow-md border-b-2 rounded border-(--main-color) font-semibold text-foreground" : " text-foreground"}`}
        onClick={() => setRole("patient")}
      >
        <Image src="/patient.svg" alt="Patient Icon" width={24} height={24} />
        Patient
      </button>
      <button
        className={`px-4 py-2 flex justify-center gap-2 items-center w-full rounded-md ${role === "hospital" ? " shadow-md border-b-2 rounded border-(--main-color) font-semibold text-foreground" : " text-foreground"}`}
        onClick={() => setRole("hospital")}
      >
        <Hospital size={24} /> Hospital
      </button>
    </div>
  );
}
