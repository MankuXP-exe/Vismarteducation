import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | Vi Smart Learning Education",
  description: "Learn how we use cookies to improve your experience on the Vi Smart Learning Education platform.",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "what-are-cookies", title: "1. What Are Cookies?" },
  { id: "cookies-we-use", title: "2. Cookies We Use" },
  { id: "how-to-control", title: "3. How to Control Cookies" },
  { id: "third-party", title: "4. Third-Party Cookies" },
  { id: "consent-banner", title: "5. Cookie Consent Banner" },
  { id: "updates", title: "6. Updates to This Policy" },
];

export default function CookiePage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="June 1, 2025"
      sections={sections}
    >
      <section id="what-are-cookies">
        <h2>1. WHAT ARE COOKIES?</h2>
        <p>
          Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.
        </p>
      </section>

      <section id="cookies-we-use">
        <h2>2. COOKIES WE USE</h2>
        
        <h3 className="text-lg font-bold mt-6 mb-3 text-gray-800">ESSENTIAL COOKIES (Cannot be disabled)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-4 py-2 font-semibold">Cookie Name</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Purpose</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">auth-token</td>
                <td className="border border-gray-200 px-4 py-2">Keeps you logged in</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">30 days</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">session-id</td>
                <td className="border border-gray-200 px-4 py-2">Manages your session</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">Session</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">csrf-token</td>
                <td className="border border-gray-200 px-4 py-2">Security protection</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold mt-6 mb-3 text-gray-800">PREFERENCE COOKIES</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-4 py-2 font-semibold">Cookie Name</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Purpose</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">theme</td>
                <td className="border border-gray-200 px-4 py-2">Light/dark mode preference</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">1 year</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">language</td>
                <td className="border border-gray-200 px-4 py-2">Language preference</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">1 year</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">video-quality</td>
                <td className="border border-gray-200 px-4 py-2">Last used video quality</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">30 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold mt-6 mb-3 text-gray-800">ANALYTICS COOKIES</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-4 py-2 font-semibold">Cookie Name</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Purpose</th>
                <th className="border border-gray-200 px-4 py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">_ga</td>
                <td className="border border-gray-200 px-4 py-2">Google Analytics tracking</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">2 years</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">_gid</td>
                <td className="border border-gray-200 px-4 py-2">GA daily tracking</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">24 hours</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium text-[#5c35d9]">page-views</td>
                <td className="border border-gray-200 px-4 py-2">Internal analytics</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-500">30 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="how-to-control">
        <h2>3. HOW TO CONTROL COOKIES</h2>
        <p><strong>Browser settings:</strong></p>
        <ul>
          <li><strong>Chrome:</strong> Settings → Privacy → Cookies</li>
          <li><strong>Firefox:</strong> Settings → Privacy & Security</li>
          <li><strong>Safari:</strong> Preferences → Privacy</li>
          <li><strong>Edge:</strong> Settings → Privacy</li>
        </ul>
        <p className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
          <strong>Note:</strong> Disabling essential cookies will prevent login and platform access.
        </p>
      </section>

      <section id="third-party">
        <h2>4. THIRD-PARTY COOKIES</h2>
        <p>We use these third-party services that may set cookies:</p>
        <ul>
          <li><strong>Google Analytics</strong> (usage analytics)</li>
          <li><strong>Razorpay</strong> (payment processing)</li>
          <li><strong>Cloudflare</strong> (CDN and security)</li>
          <li><strong>100ms</strong> (live class functionality)</li>
        </ul>
      </section>

      <section id="consent-banner">
        <h2>5. COOKIE CONSENT BANNER</h2>
        <p>When you first visit our website, you will see a cookie consent banner. You can:</p>
        <ul className="list-none pl-0 space-y-2">
          <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✅</span> Accept All Cookies</li>
          <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">⚙️</span> Manage Preferences</li>
          <li className="flex items-center gap-2"><span className="text-red-500 font-bold">❌</span> Reject Non-Essential Cookies</li>
        </ul>
      </section>

      <section id="updates">
        <h2>6. UPDATES TO THIS POLICY</h2>
        <p>
          We may update this policy as we add new features. Check this page periodically for changes.
        </p>
      </section>
    </LegalLayout>
  );
}
