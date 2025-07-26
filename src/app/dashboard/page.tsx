"use client";

import React from "react";
import { useRouter } from "next/navigation";
import InteractiveParticles from "../../components/InteractiveParticles";


const LandingPage = () => {
  const router = useRouter();

  const goToDashboard = () => {
    router.push("/upload");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <InteractiveParticles />
      <button
        onClick={goToDashboard}
        className="absolute top-1/2 left-1/2 
                   -translate-x-1/2 -translate-y-1/2
                   bg-transparent border-1 border-white text-white 
                   py-2 px-6 rounded-md text-lg cursor-pointer
                   hover:bg-gray-700 text-white hover:bg-opacity-5 transition-colors duration-300"
      >
        Tap Here !
      </button>
    </div>
  );
};

export default LandingPage;
