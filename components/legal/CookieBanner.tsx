"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "essential-only");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 text-center md:text-left">
          🍪 We use cookies to enhance your learning experience and keep you logged in.{" "}
          <Link href="/legal/cookie" className="text-[#5c35d9] font-medium hover:underline">
            Read our Cookie Policy
          </Link>
        </p>
        <div className="flex w-full md:w-auto gap-3 shrink-0">
          <button
            onClick={decline}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={accept}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold bg-[#5c35d9] text-white rounded-lg hover:bg-[#4a28b8] transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
