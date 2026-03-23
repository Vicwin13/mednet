"use client";

import HospitalLoginForm from "./HospitalLoginForm";
import HospitalSignUpForm from "./HospitalSignUpForm";
import ModeToggle from "./ModeToggle";
import PatientLoginForm from "./PatientLoginForm";
import PatientSignUpForm from "./PatientSignUpForm";
import RoleToggle from "./RoleToggle";
import { useState } from "react";

export default function AuthContainer() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"patient" | "hospital">("patient");

  const renderForm = () => {
    if (mode === "login" && role === "patient") return <PatientLoginForm />;
    if (mode === "signup" && role === "patient") return <PatientSignUpForm />;
    if (mode === "login" && role === "hospital") return <HospitalLoginForm />;
    if (mode === "signup" && role === "hospital") return <HospitalSignUpForm />;
  };

  return (
    <div className="h-full overflow-hidden  flex items-center  justify-center bg-white">
      <div className="w-full min-h-screen bg-white shadow-lg  flex items-center overflow-hidden">
        {/* LEFT SIDE DESIGN PANEL */}
        <div className="w-1/2 bg-blue-600 border-4 h-screen text-white p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold">
            {role === "patient" ? "Patient Portal" : "Hospital Portal"}
          </h2>
          <p className="mt-2 text-sm opacity-90">
            Access consultations and manage healthcare efficiently.
          </p>
        </div>

        {/* RIGHT SIDE FORM PANEL */}
        <div className="w-1/3 p-8 mx-auto h-fit">
          <RoleToggle role={role} setRole={setRole} />
          <ModeToggle mode={mode} setMode={setMode} />

          <div className="mt-6">{renderForm()}</div>
        </div>
      </div>
    </div>
  );
}
