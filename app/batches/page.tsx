"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/batches/PageHero";
import FilterBar from "@/components/batches/FilterBar";
import BatchGrid from "@/components/batches/BatchGrid";
import DiscountBanner from "@/components/batches/DiscountBanner";
import EmptyState from "@/components/batches/EmptyState";
import { fetchActiveBatches, categories } from "@/lib/batches-data";
import type { Batch } from "@/lib/batches-data";
import { createClient } from "@/lib/supabase/client";

type SortOption = "newest" | "price-asc" | "price-desc";

function BatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    fetchActiveBatches(supabase).then((data) => {
      setBatches(data);
      setLoading(false);
    });
  }, []);

  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSort, setActiveSort] = useState<SortOption>("newest");

  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "all") {
      router.push("/batches", { scroll: false });
    } else {
      router.push(`/batches?category=${cat}`, { scroll: false });
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort);
  };

  // Filter
  let filtered =
    activeCategory === "all"
      ? batches
      : batches.filter((b) => b.category === activeCategory);

  // Sort
  if (activeSort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (activeSort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <>
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2"
      >
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#5c35d9] transition-colors font-medium">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">All Batches</span>
        </nav>
      </motion.div>

      {/* Hero */}
      <PageHero />

      {/* Discount Banner */}
      <DiscountBanner />

      {/* Filter Bar */}
      <FilterBar
        activeCategory={activeCategory}
        activeSort={activeSort}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
      />

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-6 md:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#5c35d9]/30 border-t-[#5c35d9] rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading batches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => handleCategoryChange("all")} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
                batch{filtered.length !== 1 ? "es" : ""}
              </p>
            </div>
            <BatchGrid batches={filtered} />
          </>
        )}
      </section>

      {/* Bottom CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full py-10 md:py-16 px-4 md:px-8 text-center"
        style={{
          background: "linear-gradient(135deg, #1a237e 0%, #283593 60%, #1565c0 100%)",
        }}
      >
        <p className="text-amber-300 font-semibold text-xs sm:text-sm mb-2 tracking-wide uppercase">
          Need guidance?
        </p>
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Not sure which batch to choose?
        </h2>
        <p className="text-blue-200 mb-6 text-sm sm:text-base max-w-lg mx-auto">
          Our expert counsellors will help you pick the best batch — free of charge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <a
            href="tel:9821233879"
            id="cta-call-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#1a237e] font-bold rounded-xl hover:bg-amber-300 hover:text-[#1a237e] transition-all duration-200 text-sm shadow-lg"
            style={{ minHeight: "48px" }}
          >
            <Phone size={16} /> Call: 9821233879
          </a>
          <a
            href="https://wa.me/919821233879?text=Hi%2C%20I%20need%20help%20choosing%20a%20batch"
            target="_blank"
            rel="noopener noreferrer"
            id="cta-whatsapp-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25d366] text-white font-bold rounded-xl hover:bg-[#1da851] transition-all duration-200 text-sm shadow-lg"
            style={{ minHeight: "48px" }}
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
        </div>
      </motion.section>
    </>
  );
}

export default function BatchesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9ff]">
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading batches...</div>}>
          <BatchesContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
