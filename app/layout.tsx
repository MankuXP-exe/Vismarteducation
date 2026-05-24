import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import CookieBanner from "@/components/legal/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vi Smart Learning Education | Classes 5th-12th, B.COM, BBA | Garhi Harsaru",
  description:
    "Best coaching institute in Garhi Harsaru, Gurugram. Live & recorded classes for Class 5th to 12th, B.COM, BBA & Accounting courses. Pass Nahi Toh Fees Nahi.",
  keywords:
    "coaching garhi harsaru, class 11 12 coaching gurugram, accountancy classes gurugram, tally classes gurugram, vi smart learning education",
  metadataBase: new URL("https://vismartlearning.in"),
  openGraph: {
    title: "Vi Smart Learning Education | Garhi Harsaru, Gurugram",
    description:
      "Quality education for Class 5th-12th, B.COM, BBA & Accounting. Pass Nahi Toh Fees Nahi.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vi Smart Learning Education",
    description: "Best coaching institute in Garhi Harsaru, Gurugram.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <AuthProvider>
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
