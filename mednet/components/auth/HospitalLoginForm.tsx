import { Eye, EyeOff } from "lucide-react";

import React from "react";
import SpinnerBaseSquareHorizontal from "../loadingSpins";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HospitalLoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (value: string) => {
    if (value.length > 0 && value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login successful!");
      router.push("/dashboard/hospital");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className=" font-medium leading-6 font-switzer pb-2.5"
          >
            Email
          </label>
          <input
            type="email"
            placeholder="eg: hospital@example.com"
            className=" p-2 pl-3 rounded-[40px] bg-[#EEF4FF]"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="pb-2.5 font-medium leading-6 font-switzer"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`p-2 rounded-[40px] pl-3 bg-[#EEF4FF] w-full pr-10 ${
                passwordError ? "border-2 border-red-500" : ""
              }`}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-gray-900 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <span className="text-red-500 text-sm mt-2.5 font-switzer">
              {passwordError}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-(--main-color) cursor-pointer text-white py-2.5 rounded-[40px] mt-7.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerBaseSquareHorizontal />
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </>
  );
}
