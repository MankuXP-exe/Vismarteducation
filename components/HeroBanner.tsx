"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    src: "/images/banner-class11th-batch.png",
    alt: "Class 11th Batch — Vi Smart Learning Education",
    label: "Class 11th Batch",
    href: "#courses",
  },
  {
    src: "/images/banner-class12th-batch.png",
    alt: "Class 12th Batch — Vi Smart Learning Education",
    label: "Class 12th Batch",
    href: "#courses",
  },
  {
    src: "/images/banner-class12th-batch-Accountancy.png",
    alt: "Class 12th Accountancy Batch — Vi Smart Learning Education",
    label: "Class 12th Accountancy",
    href: "#courses",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  useEffect(() => {
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
      transition: { duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#1a237e] h-[220px] sm:h-[320px] md:h-[480px] lg:h-[600px] xl:h-[700px]"
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={slides[current].src}
            alt={slides[current].alt}
            fill
            className="object-cover object-center"
            priority={current === 0}
            sizes="100vw"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

          {/* CTA overlay — bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="absolute bottom-6 left-6 md:bottom-10 md:left-12"
          >
            <p className="text-white/80 text-xs md:text-sm font-medium mb-1 tracking-wide">
              {slides[current].label}
            </p>
            <a
              href={slides[current].href}
              id={`explore-batch-${current}`}
              className="inline-flex items-center gap-2 bg-[#5c35d9] hover:bg-[#4a28b8] text-white font-semibold text-sm md:text-base px-5 py-2.5 md:px-6 md:py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5"
            >
              Explore Batch <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next Arrows */}
      <button
        id="carousel-prev"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 md:p-2.5 transition-all duration-200"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        id="carousel-next"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 md:p-2.5 transition-all duration-200"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            id={`carousel-dot-${i}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2.5 bg-[#fdd835]"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
