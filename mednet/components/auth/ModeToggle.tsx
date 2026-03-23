import React from "react";

type ModeToggleProps = {
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
};

export default function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <div className="flex space-x-4 pt-5">
      <button
        className={`px-4 w-full py-2 rounded-md ${mode === "login" ? "bg-(--main-color) font-semibold text-white" : "bg-gray-300 text-gray-700"}`}
        onClick={() => setMode("login")}
      >
        Login
      </button>
      <button
        className={`px-4 w-full py-2 rounded-md ${mode === "signup" ? "bg-(--main-color) font-semibold text-white" : "bg-gray-300 text-gray-700"}`}
        onClick={() => setMode("signup")}
      >
        Register
      </button>
    </div>
  );
}
