"use client";

import Link from "next/link";
import { ArrowRight, Star, Shield, Users } from "lucide-react";

const stats = [
  { icon: Users, label: "Active Users", value: "2,000+" },
  { icon: Star, label: "Avg. Rating", value: "4.9 / 5" },
  { icon: Shield, label: "Licensed Counsellors", value: "20+" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0d0a24] via-[#1a1640] to-[#0f1635]">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl animate-float [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-brand-purple-light/10 rounded-full blur-3xl animate-float [animation-delay:2s]" />
        {/* Dot grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container-custom section-padding relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            India&rsquo;s Integrated Mental Wellness Platform
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Your Mind{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-brand-teal">
                Matters
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q50 0 100 4 Q150 8 200 2"
                  stroke="url(#underline-grad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7B68EE" />
                    <stop offset="100%" stopColor="#2ECC9A" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional counselling, self-assessment tools, wellness content, and daily
            reflection — all in one compassionate platform. Connect with licensed
            psychologists from the comfort of your home.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group btn-primary !px-8 !py-4 !text-base gap-2 w-full sm:w-auto"
            >
              Start Your Wellness Journey
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#services"
              className="btn-secondary !px-8 !py-4 !text-base !border-white/30 !text-white hover:!bg-white/10 w-full sm:w-auto"
            >
              Explore Services
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={18} className="text-brand-teal" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg leading-none">{value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20">
          <path
            d="M0 80L48 74.7C96 69 192 59 288 58.7C384 59 480 69 576 70.7C672 69 768 59 864 53.3C960 48 1056 48 1152 53.3C1248 59 1344 69 1392 74.7L1440 80V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0V80Z"
            fill="rgb(248 250 255)"
          />
        </svg>
      </div>
    </section>
  );
}
