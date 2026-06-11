"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="md:min-h-[90vh] min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
    

      <div className="">
      
        <p className="text-[#000000] text-2xl sm:text-3xl max-w-md mx-auto mb-12">
         We can’t found the page that you’re looking for :(
        </p>
        <Image src="/images/404.svg" alt="404" width={300} height={300} className="w-[80%] m-auto"/>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center mt-18 gap-2 w-50 px-5 py-2.5 rounded-lg bg-[#030F0F] text-lg font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            
          Back to Home
          </button>

          
        </div>
      </div>
    </div>
  );
}
