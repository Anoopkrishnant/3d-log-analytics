"use client"; 
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sideBar/Sidebar";
import Header from "@/components/header/header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/"];

  const isLayoutHidden = noLayoutRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {isLayoutHidden ? (
          <>{children}</>
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-auto">
              <div className="max-w-full mx-auto w-full">
                <Header />
                <main>{children}</main>
              </div>
            </div>
          </div>
         )} 
      </body>
    </html>
  );
}
