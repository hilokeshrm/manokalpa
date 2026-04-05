import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Terms of Service | Manokalpa",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">Terms of Service</h1>
            <p className="text-slate-400 text-sm mb-10">Last updated: March 2026</p>

            <div className="bg-brand-orange-pale border border-brand-orange/20 rounded-2xl p-4 mb-8 text-sm text-slate-700">
              <strong>Important:</strong> Manokalpa is a wellness support platform, not a crisis service. If you are in immediate danger or experiencing a psychiatric emergency, please call emergency services (112) or visit your nearest hospital immediately.
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "1. Acceptance of Terms",
                  content: "By using Manokalpa's platform, you agree to these Terms of Service. If you do not agree, please do not use our services.",
                },
                {
                  title: "2. Eligibility",
                  content: "You must be at least 18 years old to use our services. Users under 18 require parental or guardian consent. Our counselling services are available to residents of India.",
                },
                {
                  title: "3. Nature of Services",
                  content: "Manokalpa connects users with licensed mental health professionals for counselling and wellness support. Our services are not a substitute for emergency psychiatric care, inpatient treatment, or diagnosis of mental illness. Counsellors on our platform are independent professionals.",
                },
                {
                  title: "4. Appointments & Cancellations",
                  content: "Session cancellations must be made at least 24 hours in advance for a full refund. Cancellations within 24 hours may incur a 50% charge. No-shows are not refundable.",
                },
                {
                  title: "5. Payment Terms",
                  content: "All payments are processed securely via Razorpay. Pricing is as displayed on the platform. TDS deductions apply to counsellor earnings as per Indian tax law. Subscriptions auto-renew unless cancelled.",
                },
                {
                  title: "6. Code of Conduct",
                  content: "Users must treat counsellors with respect. Abuse, harassment, or inappropriate behaviour will result in immediate account suspension. Counsellors must maintain professional boundaries and adhere to RCI guidelines.",
                },
                {
                  title: "7. Intellectual Property",
                  content: "All content on Manokalpa — including blogs, videos, assessments, and tools — is the property of Manokalpa Wellness or its licensed providers. Personal data and session content remains yours.",
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
