import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy | Manokalpa",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-slate-400 text-sm mb-10">Last updated: March 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">
              {[
                {
                  title: "1. Information We Collect",
                  content: "We collect information you provide directly (name, email, mobile number, health details), information generated through your use of our platform (session history, assessment results, journal entries), and technical information (device ID, browser, usage data). All health and counselling information is treated as sensitive personal data.",
                },
                {
                  title: "2. How We Use Your Information",
                  content: "Your information is used to provide counselling and wellness services, match you with appropriate counsellors, send appointment reminders and notifications, improve our platform, and comply with legal obligations. We do not sell your personal data to third parties.",
                },
                {
                  title: "3. Data Security",
                  content: "We implement industry-standard security measures including end-to-end encryption for communications, bcrypt password hashing, JWT authentication with device session control, HTTPS enforcement platform-wide, and role-based access controls. All session content is confidential.",
                },
                {
                  title: "4. Counsellor Confidentiality",
                  content: "All information shared during counselling sessions is strictly confidential. Counsellors are bound by professional ethics and our platform's data policies. Session reports are visible only to the counsellor, the user, and supervising psychologists (in aggregated form only).",
                },
                {
                  title: "5. Data Retention",
                  content: "We retain your account data for as long as your account is active. Health records and session reports are retained for a minimum of 3 years as required by professional and legal standards. You may request account deletion at any time, subject to applicable legal retention requirements.",
                },
                {
                  title: "6. Your Rights",
                  content: "Under applicable law, you have the right to access your personal data, correct inaccurate information, request deletion (subject to legal requirements), withdraw consent, and lodge a complaint with a supervisory authority.",
                },
                {
                  title: "7. Contact",
                  content: "For privacy-related queries, contact our Data Protection Officer at privacy@manokalpa.in or write to Manokalpa Wellness, Bengaluru, Karnataka, India.",
                },
              ].map(({ title, content }) => (
                <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-display text-lg font-bold text-slate-900 mb-3">{title}</h2>
                  <p className="text-slate-600 leading-relaxed">{content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
