import { MessageCircle, User, Users, Heart, Globe, Building2, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: MessageCircle,
    title: "Just Listen to Me",
    subtitle: "A Safe Space to Talk",
    price: "₹500",
    priceNote: "per session",
    offers: [
      "5 sessions: 20% off",
      "10 sessions: 30% off",
      "Beyond 10: every 5th at extra 10% off",
    ],
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-brand-purple-pale",
    textColor: "text-brand-purple",
    popular: false,
    description: "A gentle, judgement-free space to share your thoughts and feelings with a trained listener.",
  },
  {
    icon: User,
    title: "Individual Counselling",
    subtitle: "Personalised Therapy",
    price: "₹800 – ₹2,000",
    priceNote: "per session",
    offers: [
      "Based on counsellor level",
      "40 min counselling + 10 min documentation",
      "Session notes & follow-up plan",
    ],
    color: "from-brand-purple to-indigo-600",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-600",
    popular: true,
    description: "One-on-one therapy tailored to your unique needs with a licensed professional.",
  },
  {
    icon: Heart,
    title: "Couples Counselling",
    subtitle: "Strengthen Your Bond",
    price: "₹3,000",
    priceNote: "per session / per couple",
    offers: [
      "Joint & individual sessions",
      "Communication skills",
      "Relationship enrichment plans",
    ],
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textColor: "text-rose-600",
    popular: false,
    description: "Guided sessions to improve communication, resolve conflict, and deepen connection.",
  },
  {
    icon: Users,
    title: "Group Counselling",
    subtitle: "Heal Together",
    price: "₹900",
    priceNote: "per person",
    offers: [
      "5–10 participants",
      "Peer support environment",
      "Themed group sessions",
    ],
    color: "from-teal-500 to-emerald-600",
    bgLight: "bg-brand-teal-pale",
    textColor: "text-brand-teal",
    popular: false,
    description: "Structured group sessions to share experiences and grow through collective insight.",
  },
  {
    icon: Sparkles,
    title: "Holistic Wellness",
    subtitle: "Mind, Body & Soul",
    price: "Custom",
    priceNote: "bundled packages",
    offers: [
      "Yoga therapy integration",
      "Nutritional counselling",
      "Naturopathic medicine",
    ],
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-brand-orange-pale",
    textColor: "text-brand-orange",
    popular: false,
    description: "An integrative approach combining yoga, nutrition, and naturopathy for complete wellness.",
  },
  {
    icon: Building2,
    title: "Corporate Wellness",
    subtitle: "For Teams & Organisations",
    price: "Custom",
    priceNote: "enterprise pricing",
    offers: [
      "Employee wellness programmes",
      "Corporate training",
      "HR dashboard & analytics",
    ],
    color: "from-slate-600 to-slate-800",
    bgLight: "bg-slate-50",
    textColor: "text-slate-700",
    popular: false,
    description: "Tailored wellness programmes that improve employee mental health and workplace productivity.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge bg-brand-teal-pale text-brand-teal mb-4">
            Our Services
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Counselling for Every{" "}
            <span className="text-brand-teal">Need</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            From a listening ear to structured therapy, we offer a full spectrum of mental
            wellness services — affordable, accessible, and professional.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`relative bg-white rounded-3xl border border-slate-100 p-6 card-hover overflow-hidden ${
                  service.popular ? "ring-2 ring-brand-purple shadow-lg shadow-brand-purple/10" : ""
                }`}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="badge bg-brand-purple text-white text-xs px-2.5 py-1">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-md`}
                >
                  <Icon size={22} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-slate-900 mb-0.5">
                  {service.title}
                </h3>
                <p className={`text-xs font-medium mb-2 ${service.textColor}`}>
                  {service.subtitle}
                </p>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Price */}
                <div className={`rounded-xl p-3 mb-4 ${service.bgLight}`}>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-bold text-xl ${service.textColor}`}>
                      {service.price}
                    </span>
                    <span className="text-slate-500 text-xs">{service.priceNote}</span>
                  </div>
                </div>

                {/* Offers */}
                <ul className="space-y-1.5 mb-5">
                  {service.offers.map((offer) => (
                    <li key={offer} className="flex items-start gap-2">
                      <CheckCircle2
                        size={14}
                        className={`flex-shrink-0 mt-0.5 ${service.textColor}`}
                      />
                      <span className="text-slate-600 text-xs">{offer}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className={`btn-primary !text-sm !py-2.5 w-full justify-center bg-gradient-to-r ${service.color} hover:opacity-90`}>
                  Book a Session
                </Link>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Each session includes 40 minutes of active counselling + 10 minutes for documentation and follow-up.
          <Link href="/register" className="text-brand-purple font-medium ml-1 hover:underline">
            Get started today →
          </Link>
        </p>
      </div>
    </section>
  );
}
