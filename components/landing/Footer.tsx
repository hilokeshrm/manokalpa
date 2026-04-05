import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, Youtube, Heart } from "lucide-react";

const links = {
  Platform: [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Our Counsellors", href: "#team" },
    { label: "Events", href: "#events" },
    { label: "Wellness Blog", href: "/content" },
  ],
  Support: [
    { label: "Contact Us", href: "#contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Book a Session", href: "/register" },
    { label: "Join as Counsellor", href: "mailto:counsellors@manokalpa.in" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const social = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter / X" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container-custom section-padding !pb-8">
        {/* Top section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Image
              src="/logo-white.svg"
              alt="Manokalpa"
              width={180}
              height={45}
              className="h-10 w-auto mb-4"
            />
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Manokalpa is India&rsquo;s integrated digital wellness platform connecting individuals
              with licensed counsellors and evidence-based self-care tools.
            </p>
            <div className="flex gap-3">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-purple flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide">
                {section}
              </h3>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-slate-400 text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-800 pt-6 mb-6">
          <p className="text-slate-500 text-xs leading-relaxed max-w-4xl">
            <strong className="text-slate-400">Disclaimer:</strong> Manokalpa is a wellness support
            platform and does not provide emergency mental health services. If you are in crisis or
            need immediate help, please contact iCall (9152987821) or Vandrevala Foundation
            (1860-2662-345) or visit your nearest hospital. Our services are not a substitute for
            emergency or inpatient psychiatric care.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Manokalpa Wellness. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs flex items-center gap-1.5">
            Built with <Heart size={12} className="text-rose-400 fill-rose-400" /> by{" "}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Anve Groups
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
