"use client";

import { Bell, ChevronDown, LogOut, User } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth");
      toast.success("Signout successfully");
    } catch (err) {
      toast.warning("Technical error occured while signing out");
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between z-50">
      {/* Logo */}
      <Link href={"/dashboard/patient"} className="flex items-center gap-2">
        <Image
          src={"/images/logo.png"}
          alt="MedNet-logo"
          width={239}
          height={65}
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {profile?.firstname || profile?.hospitalname || "User"}{" "}
              {profile?.lastname}
            </p>
            <p
              className={`text-xs text-gray-500 leading-tight ${profile?.verified === false ? "text-red-500" : "text-green-600"}`}
            >
              {profile?.role === "patient" && profile?.verified === false
                ? "Unverified Personnel"
                : "Verified Personnel"}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-6 top-16 mt-2 w-44 bg-white border border-gray-300 rounded-lg shadow-md z-50">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
