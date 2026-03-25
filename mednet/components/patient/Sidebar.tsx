"use client";
import { LayoutDashboard, Building2, CalendarDays, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#" },
  { icon: Building2, label: "Hospitals", href: "/dashboard/patient" },
  { icon: CalendarDays, label: "Appointments", href: "#" },
  { icon: Settings, label: "Settings", href: "/dashboard/patient/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 w-52 h-[calc(100vh-64px)] bg-white border-r border-gray-100 flex flex-col py-4 z-10">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon size={18} />
              {label}
            </a>
          )
        })}
      </nav>
    </aside>
  );
}