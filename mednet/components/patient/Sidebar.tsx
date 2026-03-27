"use client";

import {
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const patientNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "" },
  { icon: Building2, label: "Hospitals", href: "/dashboard/patient" },
  {
    icon: CalendarDays,
    label: "Appointments",
    href: "/dashboard/patient/appointments",
  },
  {
    icon: Wallet,
    label: "Wallet",
    href: "/dashboard/patient/hospitals/patient-wallet",
  },
  { icon: Settings, label: "Settings", href: "/dashboard/patient/settings" },
];

const hospitalNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "" },
  { icon: Users, label: "Staffs", href: "/dashboard/hospital/staffs" },
  {
    icon: ClipboardList,
    label: "Requests",
    href: "/dashboard/hospital",
  },
  {
    icon: Wallet,
    label: "Wallet",
    href: "/dashboard/wallet",
  },
  { icon: Settings, label: "Settings", href: "/dashboard/patient/settings" },
];

export default function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  const navItems =
    profile?.role === "hospital" ? hospitalNavItems : patientNavItems;

  return (
    <aside className="fixed top-16 left-0 w-52 h-[calc(100vh-64px)] bg-white border-r border-gray-100 flex flex-col py-4 z-10">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
