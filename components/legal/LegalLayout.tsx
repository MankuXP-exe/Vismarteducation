"use client";

import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import React from "react";

interface LegalSection {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
  sections,
}: LegalLayoutProps) {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Sidebar Navigation (Sticky) */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
            <h3 className="text-[#1a237e] font-bold mb-4 uppercase tracking-wider text-sm">
              Table of Contents
            </h3>
            <nav className="flex flex-col gap-2">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => scrollTo(e, sec.id)}
                  className="text-sm text-gray-600 hover:text-[#5c35d9] hover:bg-[#f0f4ff] px-3 py-2 rounded-lg transition-colors"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-2">Need Help?</p>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                If you have questions about our policies, our support team is available to assist you.
              </p>
              <a 
                href="https://wa.me/919821233879" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageCircle size={16} />
                WhatsApp Support
              </a>
            </div>
          </div>
        </aside>

        {/* RIGHT: Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 border border-gray-100">
            {/* Header */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-[#5c35d9]">Home</Link>
                <ChevronRight size={12} />
                <span>Legal</span>
                <ChevronRight size={12} />
                <span className="text-gray-900 font-medium">{title}</span>
              </nav>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a237e]">
                  {title}
                </h1>
                <div className="shrink-0">
                  <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full font-medium">
                    Last Updated: {lastUpdated}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <article className="prose prose-sm md:prose-base max-w-none prose-headings:text-[#1a237e] prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 marker:text-[#5c35d9] prose-a:text-[#5c35d9] prose-a:no-underline hover:prose-a:underline">
              {children}
            </article>

            {/* Footer / Feedback */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-xl p-6">
              <div>
                <p className="font-semibold text-gray-900 text-center sm:text-left">Was this helpful?</p>
                <p className="text-sm text-gray-500">Let us know if this document was clear.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white transition-colors bg-transparent">
                  Yes, thanks
                </button>
                <button className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white transition-colors bg-transparent">
                  No, it wasn't
                </button>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
