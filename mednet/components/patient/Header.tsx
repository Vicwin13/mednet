"use client";

import { Bell, ChevronDown, User } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { profile } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between z-50">
      {/* Logo */}
      <div className="flex items-center justify-center">
        <Link href={"/dashboard/patient"} className="flex items-center gap-2">
          <Image
            src={"/images/logo.png"}
            alt="MedNet-logo"
            width={239}
            height={65}
          />
        </Link>

        <button className="p-3 rounded-lg bg-blue-600 text-white cursor-pointer">
          MedNet Wallet
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors">
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
              {profile?.verified === false
                ? "Unverified Personnel"
                : "Verified Personnel"}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default Header;
