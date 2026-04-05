import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="relative bg-gradient-to-br from-brand-purple via-indigo-700 to-brand-purple-light rounded-3xl overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-brand-teal/10 blur-3xl" />
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots-cta" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots-cta)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white/80 text-sm font-medium mb-6">
              <Sparkles size={15} className="text-brand-teal" />
              Begin Your Transformation Today
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
              Your Journey to Wellness Starts with One Step
            </h2>

            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of individuals who have taken control of their mental health with
              Manokalpa. Confidential, affordable, and always here for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-purple font-bold text-base hover:bg-brand-purple-pale transition-all duration-200 shadow-lg w-full sm:w-auto justify-center"
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200 w-full sm:w-auto justify-center"
              >
                Learn More
              </Link>
            </div>

            <p className="text-white/40 text-sm mt-6">
              No credit card required · Free initial consultation · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
