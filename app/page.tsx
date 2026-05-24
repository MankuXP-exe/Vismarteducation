import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import TrustStats from "@/components/TrustStats";
import WhatIsViSmart from "@/components/WhatIsViSmart";
import CourseCategories from "@/components/CourseCategories";
import FeaturedBatches from "@/components/FeaturedBatches";
import DiscountSection from "@/components/DiscountSection";
import AccountingCourses from "@/components/AccountingCourses";
import StatsSection from "@/components/StatsSection";
import Testimonials from "@/components/Testimonials";
import ResultsSection from "@/components/ResultsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <HeroBanner />
      <TrustStats />
      <WhatIsViSmart />
      <CourseCategories />
      <FeaturedBatches />
      <DiscountSection />
      <AccountingCourses />
      <StatsSection />
      <Testimonials />
      <ResultsSection />
      <WhyChooseUs />
      <CTABanner />
      <Footer />
    </main>
  );
}
