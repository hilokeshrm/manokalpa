import Link from "next/link";
import { Award, Star, Users } from "lucide-react";

const expertise = [
  "Clinical Psychology",
  "Counselling Psychology",
  "Psychiatry",
  "Naturopathy & Yoga",
  "Health Psychology",
  "CBT & DBT",
  "Relationship Therapy",
  "Substance Use",
  "Adolescent Mental Health",
  "Stress & Burnout",
];

const credentials = [
  { icon: Award, label: "RCI Licensed Professionals" },
  { icon: Star, label: "Avg. 4.9★ Client Rating" },
  { icon: Users, label: "20+ Verified Counsellors" },
];

export default function Team() {
  return (
    <section id="team" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="badge bg-brand-teal-pale text-brand-teal mb-4">
            Our Team
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Guided by{" "}
            <span className="text-brand-teal">Expert Professionals</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Our panel of mental health professionals brings decades of combined experience across
            clinical psychology, psychiatry, counselling, and holistic wellness — all verified and
            licensed.
          </p>
        </div>

        {/* Credential badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {credentials.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-50 border border-slate-200"
            >
              <Icon size={18} className="text-brand-purple" />
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>

        {/* Expertise cloud */}
        <div className="bg-gradient-to-br from-brand-purple to-indigo-700 rounded-3xl p-8 md:p-12 text-white mb-12">
          <h3 className="font-display text-xl font-bold text-center mb-8 text-white/80">
            Areas of Expertise
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {expertise.map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-medium text-white/90 hover:bg-white/25 transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Approach cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Integrative Therapy",
              desc: "Our counsellors use evidence-based approaches tailored to your individual needs — CBT, DBT, person-centred, and more.",
              bg: "bg-brand-purple-pale",
              accent: "text-brand-purple",
            },
            {
              title: "Holistic Healing",
              desc: "Beyond talk therapy, we integrate yoga therapy, naturopathy, and nutritional counselling for whole-person wellness.",
              bg: "bg-brand-teal-pale",
              accent: "text-brand-teal",
            },
            {
              title: "Supervised Practice",
              desc: "Clinical supervisors oversee counsellor performance and session quality, ensuring the highest standards of care.",
              bg: "bg-brand-orange-pale",
              accent: "text-brand-orange",
            },
          ].map(({ title, desc, bg, accent }) => (
            <div key={title} className={`${bg} rounded-2xl p-6`}>
              <h4 className={`font-display font-bold text-lg mb-2 ${accent}`}>{title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">Ready to connect with the right counsellor for you?</p>
          <Link href="/register" className="btn-primary">
            Find My Counsellor
          </Link>
        </div>
      </div>
    </section>
  );
}
