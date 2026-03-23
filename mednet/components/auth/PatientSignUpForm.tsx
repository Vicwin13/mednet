import { Eye, EyeOff } from "lucide-react";

import React from "react";
import SpinnerBaseSquareHorizontal from "../loadingSpins";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PatientSignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (value: string) => {
    if (value.length > 0 && value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (value.length > 0 && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    // Re-validate confirm password when password changes
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate password
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      await signUp(email, password, {
        role: "patient",
        firstName,
        lastName,
      });
      toast.success(
        "Sign up successful! Please check your email to verify your account and the. login",
      );
      router.push("/");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignUp} className="flex  flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col flex-1">
            <label
              htmlFor="firstname"
              className="font-medium leading-6 font-switzer pb-2.5"
            >
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              className="p-2 pl-3 w-full rounded-[40px] bg-[#EEF4FF]"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1">
            <label
              htmlFor="lastname"
              className="font-medium leading-6 font-switzer pb-2.5"
            >
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              className="p-2 pl-3 w-full rounded-[40px] bg-[#EEF4FF]"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="font-medium leading-6 font-switzer pb-2.5"
          >
            Email
          </label>
          <input
            type="email"
            placeholder="eg: johndoe@gmail.com"
            className="p-2 pl-3 rounded-[40px] bg-[#EEF4FF]"
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

        <div className="flex flex-col">
          <label
            htmlFor="confirmPassword"
            className="pb-2.5 font-medium leading-6 font-switzer"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className={`p-2 rounded-[40px] pl-3 bg-[#EEF4FF] w-full pr-10 ${
                confirmPasswordError ? "border-2 border-red-500" : ""
              }`}
              onChange={handleConfirmPasswordChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-gray-900 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {confirmPasswordError && (
            <span className="text-red-500 text-sm mt-2.5 font-switzer">
              {confirmPasswordError}
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
              <span>Registering...</span>
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>
    </>
  );
}
