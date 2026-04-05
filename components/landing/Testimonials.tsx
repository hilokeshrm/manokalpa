import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya M.",
    location: "Bengaluru",
    rating: 5,
    text: "Manokalpa changed how I view therapy. The platform is so easy to use, and my counsellor really understood what I was going through. I finally feel like myself again.",
    service: "Individual Counselling",
  },
  {
    name: "Rahul K.",
    location: "Mumbai",
    rating: 5,
    text: "The 'Just Listen to Me' sessions were exactly what I needed — no diagnosis, just someone to talk to. Affordable and genuinely helpful.",
    service: "Just Listen to Me",
  },
  {
    name: "Deepa & Anand",
    location: "Hyderabad",
    rating: 5,
    text: "After six months of couples counselling through Manokalpa, our relationship is in a completely different place. We communicate so much better now.",
    service: "Couples Counselling",
  },
  {
    name: "Sneha R.",
    location: "Pune",
    rating: 5,
    text: "The reflection journal and daily assessments keep me grounded. I love how the platform helps me track my mental wellness journey week by week.",
    service: "Platform Features",
  },
  {
    name: "Arun S.",
    location: "Chennai",
    rating: 5,
    text: "The group counselling sessions gave me a community I didn't know I needed. Hearing others share similar struggles made me feel so much less alone.",
    service: "Group Counselling",
  },
  {
    name: "Kavitha T.",
    location: "Bangalore",
    rating: 5,
    text: "Dr. Anaghashree's holistic approach combining yoga and nutrition with counselling was transformative. I sleep better, feel better, and think better.",
    service: "Holistic Wellness",
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge bg-yellow-50 text-yellow-600 mb-4">
            Client Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Real People,{" "}
            <span className="text-brand-purple">Real Transformations</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-slate-700 font-semibold ml-1">4.9</span>
            <span className="text-slate-400 text-sm">from 500+ reviews</span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm card-hover ${
                i === 1 ? "sm:mt-6" : i === 3 ? "lg:mt-6" : ""
              }`}
            >
              {/* Quote icon */}
              <div className="w-10 h-10 rounded-xl bg-brand-purple-pale flex items-center justify-center mb-4">
                <Quote size={18} className="text-brand-purple" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-slate-400 text-xs">{t.location}</div>
                </div>
                <span className="ml-auto badge bg-slate-100 text-slate-500 text-xs">
                  {t.service}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
