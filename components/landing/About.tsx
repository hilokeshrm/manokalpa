import { Heart, Target, Eye, CheckCircle2 } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Compassionate Care",
    description:
      "Every interaction is designed with empathy, ensuring users feel heard and supported throughout their wellness journey.",
    color: "bg-brand-purple-pale text-brand-purple",
  },
  {
    icon: Target,
    title: "Evidence-Informed",
    description:
      "All assessments, tools, and counselling approaches are grounded in established psychological research and clinical best practices.",
    color: "bg-brand-teal-pale text-brand-teal",
  },
  {
    icon: Eye,
    title: "Holistic Approach",
    description:
      "We address mental, emotional, physical, and social well-being, recognising that true wellness is multidimensional.",
    color: "bg-brand-orange-pale text-brand-orange",
  },
];

const features = [
  "RCI Licensed & Certified Counsellors",
  "Secure, Confidential Sessions",
  "Flexible Scheduling (Online & Offline)",
  "Affordable Subscription Plans",
  "Multilingual Support",
  "AI-Powered Wellness Companion",
];

export default function About() {
  return (
    <section id="about" className="section-padding bg-[#F8F7FF]">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="badge bg-brand-purple-pale text-brand-purple mb-4">
            About Manokalpa
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Making Mental Wellness{" "}
            <span className="text-brand-purple">Accessible to All</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Manokalpa (मनोकल्प) — meaning &lsquo;a vision for the mind&rsquo; — is a comprehensive digital
            ecosystem connecting individuals with licensed mental health professionals,
            evidence-based tools, and a supportive wellness community.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple-pale flex items-center justify-center mb-5">
              <Eye size={24} className="text-brand-purple" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
            <p className="text-slate-600 leading-relaxed">
              To democratise access to quality mental health support by providing a structured,
              evidence-informed, and user-friendly digital platform that integrates professional
              counselling, self-guided wellness tools, educational content, and community
              engagement in one cohesive experience.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-purple to-brand-purple-light rounded-3xl p-8 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-white/80 leading-relaxed">
              To make psychological wellness approachable, personalised, and impactful — bridging
              the critical gap in accessible, affordable mental health support across India, one
              session at a time.
            </p>
            <div className="mt-6 space-y-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-teal flex-shrink-0" />
                  <span className="text-sm text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-slate-100 card-hover"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
