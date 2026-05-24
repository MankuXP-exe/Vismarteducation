"use client";

import { motion } from "framer-motion";

export default function PageHero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
        minHeight: "160px",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: "#fdd835" }}
      />
      <div
        className="absolute -bottom-8 left-20 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: "#5c35d9" }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-7 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        {/* Left side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1.5 leading-tight"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            All Batches & Courses
          </h1>
          <p className="text-sm font-semibold mb-4" style={{ color: "#fdd835" }}>
            Live classes · Recorded lectures · Pass guarantee
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {["📚 8 Courses", "👨‍🎓 500+ Students", "⭐ 4.8 Rating"].map((stat) => (
              <span
                key={stat}
                className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20"
              >
                {stat}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right side — Help card: compact on mobile, full on md+ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-auto md:min-w-[230px] md:shrink-0"
        >
          {/* Mobile: horizontal pill bar */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="tel:9821233879"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/20 border border-white/30 text-white font-bold rounded-xl text-sm active:scale-95 transition-transform"
            >
              📞 Call Us
            </a>
            <a
              href="https://wa.me/919821233879?text=Hi%2C%20I%20need%20help%20choosing%20a%20batch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25d366] text-white font-bold rounded-xl text-sm active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Desktop: full card */}
          <div
            className="hidden md:block bg-white rounded-2xl shadow-2xl p-5"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <p className="text-sm font-bold text-gray-800 mb-1">📞 Need help choosing?</p>
            <p className="text-[13px] text-gray-500 mb-3">Our counsellors are here to help</p>
            <a
              href="tel:9821233879"
              className="block text-center font-bold text-[#1a237e] text-base mb-3 hover:text-[#5c35d9] transition-colors"
            >
              📲 9821233879
            </a>
            <a
              href="https://wa.me/919821233879?text=Hi%2C%20I%20need%20help%20choosing%20a%20batch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25d366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
