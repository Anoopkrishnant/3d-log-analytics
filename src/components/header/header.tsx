import React from "react";
import Image from "next/image";
import { Bell } from "lucide-react";
import admin from "../../../public/images/admin.jpg";

const Header: React.FC = () => {
  return (
    <header className="bg-[#1e1e1e] shadow-lg border-b border-[#1f1f1f]  sm:mx-6 lg:mx-8 mt-4 mb-4 rounded-xl">
      <div className=" mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100">
          Dashboard
        </h1>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="relative">
            <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 cursor-pointer hover:text-white" />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src={admin}
              alt="admin"
              width={35}
              height={35}
              className="rounded-full border border-gray-600"
            />
            <span className="hidden sm:block text-gray-100 font-medium">
              John Mark
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
