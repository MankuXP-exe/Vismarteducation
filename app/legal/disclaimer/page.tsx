import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Disclaimer | Vi Smart Learning Education",
  description: "Read the disclaimer for the Vi Smart Learning Education platform regarding educational content and results.",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "general-disclaimer", title: "1. General Disclaimer" },
  { id: "results-disclaimer", title: "2. Results Disclaimer" },
  { id: "educational-content", title: "3. Educational Content" },
  { id: "technical-disclaimer", title: "4. Technical Disclaimer" },
  { id: "third-party-content", title: "5. Third-Party Content" },
  { id: "limitation-liability", title: "6. Limitation of Liability" },
  { id: "contact", title: "7. Contact" },
];

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      lastUpdated="June 1, 2025"
      sections={sections}
    >
      <section id="general-disclaimer">
        <h2>1. GENERAL DISCLAIMER</h2>
        <p>
          The information provided on the Vi Smart Learning Education platform is for educational purposes only. While we strive for accuracy and quality, we make no warranties about the completeness or accuracy of the content.
        </p>
      </section>

      <section id="results-disclaimer">
        <h2>2. RESULTS DISCLAIMER</h2>
        <ul>
          <li>Results shown on our website are of actual students</li>
          <li>Individual results may vary based on student effort, aptitude, and personal circumstances</li>
          <li>We do not guarantee specific marks, grades, or ranks</li>
          <li>Past results do not guarantee future performance</li>
        </ul>
      </section>

      <section id="educational-content">
        <h2>3. EDUCATIONAL CONTENT</h2>
        <ul>
          <li>Content is aligned with CBSE curriculum guidelines</li>
          <li>We are not affiliated with CBSE, any state board, or any university</li>
          <li>Curriculum and syllabus may change as per board updates</li>
          <li>We endeavour to update content but cannot guarantee real-time alignment</li>
        </ul>
      </section>

      <section id="technical-disclaimer">
        <h2>4. TECHNICAL DISCLAIMER</h2>
        <ul>
          <li>Platform performance depends on internet connectivity</li>
          <li>We do not guarantee uninterrupted access to live classes</li>
          <li>Recorded lectures will be available within 24 hours of live class completion</li>
          <li>We are not responsible for device compatibility issues</li>
        </ul>
      </section>

      <section id="third-party-content">
        <h2>5. THIRD-PARTY CONTENT</h2>
        <p>
          If our platform links to external websites or resources, we are not responsible for their content, accuracy, or availability.
        </p>
      </section>

      <section id="limitation-liability">
        <h2>6. LIMITATION OF LIABILITY</h2>
        <p>
          Vi Smart Learning Education, its directors, teachers, and staff shall not be liable for any direct, indirect, or consequential damages arising from use of this platform.
        </p>
      </section>

      <section id="contact">
        <h2>7. CONTACT</h2>
        <p>
          For any concerns: 9821233879 | support@vismart.edu.in
        </p>
      </section>
    </LegalLayout>
  );
}
