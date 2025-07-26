"use client";

import {
  Bell,
  House,
  Info,
  Mail,
  Settings,
  Upload,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type IconName =
  | "House"
  | "Upload"
  | "FileText"
  | "Settings"
  | "Mail"
  | "Bell"
  | "Info"
  | "LogOut";

const ICONS: Record<IconName, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  House,
  Upload,
  FileText,
  Settings,
  Mail,
  Bell,
  Info,
  LogOut,
};

interface SidebarItem {
  name: string;
  href: string;
  icon: IconName;
}

const data = {
  sidebarItems: [
    
    { name: "Upload", href: "/upload", icon: "Upload" },
    { name: "Logs", href: "/logstats", icon: "FileText" },
    { name: "Settings", href: "", icon: "Settings" },
    { name: "Messages", href: "", icon: "Mail" },
    { name: "Notifications", href: "", icon: "Bell" },
    { name: "Help", href: "", icon: "Info" },
  ] as SidebarItem[],
};

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarItems] = useState<SidebarItem[]>(data.sidebarItems);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="h-full bg-[#1e1e1e] backdrop-blur-md p-4 flex flex-col border-r border-[#2f2f2f]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-[#2f2f2f] transition-colors max-w-fit cursor-pointer"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={24} />
        </button>

        <nav className="mt-8 flex-grow">
          <div className="flex flex-col gap-2">
            {sidebarItems.map((item) => {
              const IconComponent = ICONS[item.icon];
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center p-4 gap-2 text-sm font-medium rounded-lg hover:bg-[#2f2f2f] transition-colors ${
                      pathname === item.href ? "bg-[#2f2f2f]" : ""
                    }`}
                  >
                    <IconComponent size={20} style={{ minWidth: "20px" }} />
                    {isSidebarOpen && (
                      <span className="ml-4 whitespace-nowrap">{item.name}</span>
                    )}
                  </div>
                </Link>
              );
            })}

            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-4 gap-2 text-sm font-medium rounded-lg hover:bg-[#2f2f2f] transition-colors text-red-400"
                aria-label="Logout"
              >
                <LogOut size={20} />
                {isSidebarOpen && (
                  <span className="ml-4 whitespace-nowrap">Logout</span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
