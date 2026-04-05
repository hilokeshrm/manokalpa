import { UserPlus, ClipboardList, CalendarCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up in minutes. Complete your health profile and wellness assessment to help us understand your needs.",
    color: "bg-brand-purple text-white",
    connector: true,
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Take Your Assessment",
    description:
      "Complete our evidence-based questionnaires covering stress, anxiety, mood, and overall wellbeing.",
    color: "bg-brand-teal text-white",
    connector: true,
  },
  {
    step: "03",
    icon: CalendarCheck,
    title: "Book a Session",
    description:
      "Browse verified counsellors, check their availability, and book a session at a time that works for you.",
    color: "bg-brand-orange text-white",
    connector: true,
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Grow & Thrive",
    description:
      "Track your progress, journal daily reflections, explore wellness content, and attend community events.",
    color: "bg-indigo-500 text-white",
    connector: false,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-[#F8F7FF]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge bg-brand-purple-pale text-brand-purple mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Start Your Wellness Journey{" "}
            <span className="text-brand-purple">in 4 Steps</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Getting started with Manokalpa is simple, quick, and completely confidential.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-purple via-brand-teal to-indigo-500 opacity-20" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, icon: Icon, title, description, color }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Step number bubble */}
                <div className="relative mb-5">
                  <div
                    className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/10 z-10 relative`}
                  >
                    <Icon size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    {step}
                  </div>
                </div>

                <h3 className="font-display font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform features grid */}
        <div className="mt-20 bg-white rounded-3xl border border-slate-100 p-8 md:p-12">
          <h3 className="font-display text-2xl font-bold text-slate-900 text-center mb-10">
            Everything You Need for Holistic Wellness
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { emoji: "🧠", label: "Assessments" },
              { emoji: "📓", label: "Reflection Journal" },
              { emoji: "📚", label: "Learning Hub" },
              { emoji: "🎙️", label: "Podcasts & Radio" },
              { emoji: "🗓️", label: "Events" },
              { emoji: "💬", label: "Secure Chat" },
              { emoji: "🤖", label: "AI Companion" },
              { emoji: "📊", label: "Progress Tracking" },
              { emoji: "🌱", label: "Life Skills" },
              { emoji: "💳", label: "Easy Payments" },
              { emoji: "🔔", label: "Notifications" },
              { emoji: "📱", label: "Mobile Friendly" },
            ].map(({ emoji, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-brand-purple-pale transition-colors cursor-default"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
