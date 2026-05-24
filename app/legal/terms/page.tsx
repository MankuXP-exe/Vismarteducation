import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Vi Smart Learning Education",
  description: "Read the terms and conditions for using Vi Smart Learning Education platform, batches, and services.",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "definitions", title: "2. Definitions" },
  { id: "eligibility", title: "3. Eligibility" },
  { id: "user-accounts", title: "4. User Accounts" },
  { id: "batch-enrollment", title: "5. Batch Enrollment & Access" },
  { id: "content", title: "6. Content & Intellectual Property" },
  { id: "conduct", title: "7. Code of Conduct" },
  { id: "payment", title: "8. Payment Terms" },
  { id: "availability", title: "9. Platform Availability" },
  { id: "termination", title: "10. Termination" },
  { id: "liability", title: "11. Limitation of Liability" },
  { id: "governing-law", title: "12. Governing Law" },
  { id: "changes", title: "13. Changes to Terms" },
  { id: "contact", title: "14. Contact Us" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      lastUpdated="June 1, 2025"
      sections={sections}
    >
      <section id="introduction">
        <h2>1. INTRODUCTION</h2>
        <p>
          These Terms and Conditions govern your use of the Vi Smart Learning Education platform (vismart.edu.in) and all services provided by us, including live classes, recorded lectures, study materials, and batch enrollments.
        </p>
        <p>
          By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part, please discontinue use of our services immediately.
        </p>
      </section>

      <section id="definitions">
        <h2>2. DEFINITIONS</h2>
        <ul>
          <li><strong>"Platform"</strong> means the Vi Smart Learning Education website and all its services</li>
          <li><strong>"Student"</strong> means any individual enrolled in a batch or course</li>
          <li><strong>"Teacher/Faculty"</strong> means educators delivering content</li>
          <li><strong>"Batch"</strong> means a structured course with live/recorded classes</li>
          <li><strong>"We/Us/Our"</strong> refers to Vi Smart Learning Education, Garhi Harsaru, Gurugram, Haryana</li>
        </ul>
      </section>

      <section id="eligibility">
        <h2>3. ELIGIBILITY</h2>
        <ul>
          <li>You must be at least 13 years old to use this platform</li>
          <li>Students below 18 require parent/guardian consent</li>
          <li>You must provide accurate information during registration</li>
          <li>One account per student only</li>
        </ul>
      </section>

      <section id="user-accounts">
        <h2>4. USER ACCOUNTS</h2>
        <ul>
          <li>You are responsible for maintaining account confidentiality</li>
          <li>Do not share login credentials with others</li>
          <li>Report unauthorized access immediately to 9821233879</li>
          <li>We reserve the right to suspend accounts violating terms</li>
        </ul>
      </section>

      <section id="batch-enrollment">
        <h2>5. BATCH ENROLLMENT & ACCESS</h2>
        <ul>
          <li>Access is granted only after successful payment</li>
          <li>Batch access is non-transferable to another person</li>
          <li>Access duration is as specified in the batch (e.g. 1 year)</li>
          <li>We reserve the right to modify batch content and schedule</li>
          <li>Live class timings may change with prior notice of 24 hours</li>
        </ul>
      </section>

      <section id="content">
        <h2>6. CONTENT & INTELLECTUAL PROPERTY</h2>
        <ul>
          <li>All content (videos, notes, PDFs, tests) is owned by Vi Smart Learning Education</li>
          <li>Students may not record, download, share, or redistribute any content without written permission</li>
          <li>Screenshots and screen recording of live/recorded classes is strictly prohibited</li>
          <li>Violation may result in immediate account termination and legal action</li>
        </ul>
      </section>

      <section id="conduct">
        <h2>7. CODE OF CONDUCT</h2>
        <p>Students must NOT:</p>
        <ul>
          <li>Use abusive, offensive, or inappropriate language in live class chats</li>
          <li>Disrupt live classes or harass teachers/other students</li>
          <li>Share exam papers, tests, or answers without permission</li>
          <li>Attempt to hack or misuse the platform</li>
          <li>Create fake accounts or impersonate others</li>
        </ul>
      </section>

      <section id="payment">
        <h2>8. PAYMENT TERMS</h2>
        <ul>
          <li>All prices are in Indian Rupees (INR)</li>
          <li>Payments are processed securely via Razorpay</li>
          <li>GST applicable as per government regulations</li>
          <li>Special discounts (Army/Differently Abled/Single Parent) require valid documentation before activation</li>
          <li>Fee once paid is subject to our Refund Policy</li>
        </ul>
      </section>

      <section id="availability">
        <h2>9. PLATFORM AVAILABILITY</h2>
        <ul>
          <li>We strive for 99% uptime but do not guarantee uninterrupted access</li>
          <li>Scheduled maintenance will be notified in advance</li>
          <li>We are not liable for internet connectivity issues on student's end</li>
        </ul>
      </section>

      <section id="termination">
        <h2>10. TERMINATION</h2>
        <p>We may terminate your account without notice if you:</p>
        <ul>
          <li>Violate any of these terms</li>
          <li>Engage in fraudulent activity</li>
          <li>Attempt to misuse or hack the platform</li>
        </ul>
        <p>No refund will be issued upon termination due to policy violation.</p>
      </section>

      <section id="liability">
        <h2>11. LIMITATION OF LIABILITY</h2>
        <p>Vi Smart Learning Education shall not be liable for:</p>
        <ul>
          <li>Any indirect or consequential loss</li>
          <li>Loss of data or content</li>
          <li>Third-party service failures (internet, payment gateways)</li>
        </ul>
        <p>Our maximum liability is limited to the fees paid by the student.</p>
      </section>

      <section id="governing-law">
        <h2>12. GOVERNING LAW</h2>
        <p>
          These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Gurugram, Haryana.
        </p>
      </section>

      <section id="changes">
        <h2>13. CHANGES TO TERMS</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance. Major changes will be communicated via registered email.
        </p>
      </section>

      <section id="contact">
        <h2>14. CONTACT US</h2>
        <p>
          <strong>Vi Smart Learning Education</strong><br />
          Garhi Harsaru, Near Punjab National Bank<br />
          Gurugram, Haryana — 122505<br />
          📞 9821233879<br />
          📧 support@vismart.edu.in
        </p>
      </section>
    </LegalLayout>
  );
}
