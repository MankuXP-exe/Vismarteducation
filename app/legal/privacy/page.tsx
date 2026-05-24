import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Vi Smart Learning Education",
  description: "Learn how Vi Smart Learning Education collects, uses, and protects your personal data.",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information-collected", title: "2. Information We Collect" },
  { id: "how-we-use", title: "3. How We Use Your Information" },
  { id: "data-sharing", title: "4. Data Sharing" },
  { id: "data-security", title: "5. Data Storage & Security" },
  { id: "cookies", title: "6. Cookies" },
  { id: "your-rights", title: "7. Your Rights" },
  { id: "childrens-privacy", title: "8. Children's Privacy" },
  { id: "third-party-links", title: "9. Third-Party Links" },
  { id: "changes", title: "10. Changes to This Policy" },
  { id: "contact", title: "11. Contact for Privacy Concerns" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="June 1, 2025"
      sections={sections}
    >
      <section id="introduction">
        <h2>1. INTRODUCTION</h2>
        <p>
          Vi Smart Learning Education is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights regarding your data.
        </p>
      </section>

      <section id="information-collected">
        <h2>2. INFORMATION WE COLLECT</h2>
        <p><strong>Personal Information:</strong></p>
        <ul>
          <li>Full name, email address, phone number</li>
          <li>Date of birth and class/grade</li>
          <li>Parent/guardian name and contact (for minors)</li>
          <li>Profile photo (optional)</li>
        </ul>
        
        <p><strong>Payment Information:</strong></p>
        <ul>
          <li>Transaction ID and payment status</li>
          <li>We do NOT store card numbers or UPI PINs</li>
          <li>All payments are processed by Razorpay (PCI-DSS compliant)</li>
        </ul>
        
        <p><strong>Usage Data:</strong></p>
        <ul>
          <li>Videos watched and progress percentage</li>
          <li>Login times and device information</li>
          <li>Browser type, IP address, pages visited</li>
          <li>Live class attendance records</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>3. HOW WE USE YOUR INFORMATION</h2>
        <ul>
          <li>To create and manage your student account</li>
          <li>To provide access to purchased batches and content</li>
          <li>To send class schedules, updates, and notifications</li>
          <li>To process payments and issue receipts</li>
          <li>To improve our platform and content quality</li>
          <li>To send important announcements via SMS/WhatsApp/Email</li>
          <li>To prevent fraud and ensure platform security</li>
        </ul>
      </section>

      <section id="data-sharing">
        <h2>4. DATA SHARING</h2>
        <p>We do NOT sell your personal data to anyone.</p>
        <p>We share data only with:</p>
        <ul>
          <li>Payment processors (Razorpay) for transactions</li>
          <li>Video hosting (Cloudflare) for content delivery</li>
          <li>Live class providers (100ms) for class sessions</li>
          <li>Legal authorities if required by Indian law</li>
        </ul>
      </section>

      <section id="data-security">
        <h2>5. DATA STORAGE & SECURITY</h2>
        <ul>
          <li>Data stored on secure cloud servers in India</li>
          <li>Encrypted using industry-standard SSL/TLS</li>
          <li>Access limited to authorized staff only</li>
          <li>Regular security audits conducted</li>
          <li>Passwords are hashed and never stored in plain text</li>
        </ul>
      </section>

      <section id="cookies">
        <h2>6. COOKIES</h2>
        <p>We use cookies for:</p>
        <ul>
          <li>Keeping you logged in</li>
          <li>Remembering your preferences</li>
          <li>Analyzing platform usage</li>
        </ul>
        <p>See our Cookie Policy for full details.</p>
      </section>

      <section id="your-rights">
        <h2>7. YOUR RIGHTS (under IT Act 2000 & DPDP Act 2023)</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data we hold</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your account and data</li>
          <li>Withdraw consent for marketing communications</li>
          <li>File a complaint with the Data Protection Board of India</li>
        </ul>
        <p>To exercise these rights: 9821233879 or support@vismart.edu.in</p>
      </section>

      <section id="childrens-privacy">
        <h2>8. CHILDREN'S PRIVACY</h2>
        <ul>
          <li>Our platform serves students from Class 9 onwards (age 13+)</li>
          <li>For students under 18, parental consent is required</li>
          <li>We do not knowingly collect data from children under 13</li>
          <li>Parents can request data deletion by contacting us</li>
        </ul>
      </section>

      <section id="third-party-links">
        <h2>9. THIRD-PARTY LINKS</h2>
        <p>
          Our platform may contain links to third-party websites. We are not responsible for their privacy practices. Please review their policies separately.
        </p>
      </section>

      <section id="changes">
        <h2>10. CHANGES TO THIS POLICY</h2>
        <p>
          We may update this policy periodically. Significant changes will be notified via email. Last updated date will always be shown at the top.
        </p>
      </section>

      <section id="contact">
        <h2>11. CONTACT FOR PRIVACY CONCERNS</h2>
        <p>
          <strong>Privacy Officer — Vi Smart Learning Education</strong><br />
          Garhi Harsaru, Gurugram, Haryana<br />
          📞 9821233879 | 📧 support@vismart.edu.in
        </p>
      </section>
    </LegalLayout>
  );
}
