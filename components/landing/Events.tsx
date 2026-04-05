import Link from "next/link";
import { Calendar, Radio, Video, MapPin, Clock, ArrowRight } from "lucide-react";

const eventTypes = [
  {
    icon: Video,
    title: "Live Webinars",
    description: "Interactive online sessions on mental health topics, facilitated by our expert panel.",
    color: "bg-brand-purple-pale text-brand-purple",
    count: "2–3 per month",
  },
  {
    icon: Radio,
    title: "Wellness Radio",
    description: "Curated audio content — podcasts, guided meditations, and expert talks, available on-demand.",
    color: "bg-brand-teal-pale text-brand-teal",
    count: "New weekly",
  },
  {
    icon: MapPin,
    title: "Offline Workshops",
    description: "In-person mindfulness workshops, group therapy sessions, and community wellness events.",
    color: "bg-brand-orange-pale text-brand-orange",
    count: "Monthly",
  },
];

const upcomingEvents = [
  {
    title: "Managing Anxiety in the Workplace",
    type: "Webinar",
    date: "28 March 2026",
    time: "6:00 PM",
    host: "Dr. Madhu Karnat S",
    mode: "Online",
    free: true,
    category: "Mental Health",
  },
  {
    title: "Mindfulness & Stress Reduction",
    type: "Workshop",
    date: "5 April 2026",
    time: "10:00 AM",
    host: "Dr. Anaghashree S",
    mode: "Offline · Bengaluru",
    free: false,
    category: "Wellness",
  },
  {
    title: "Relationships & Communication",
    type: "Group Session",
    date: "12 April 2026",
    time: "4:00 PM",
    host: "Ms. Anupama Hegde",
    mode: "Online",
    free: false,
    category: "Relationships",
  },
];

export default function Events() {
  return (
    <section id="events" className="section-padding bg-[#F8F7FF]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge bg-brand-purple-pale text-brand-purple mb-4">
            Events & Community
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-5">
            Learn, Connect &{" "}
            <span className="text-brand-purple">Grow Together</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Join a vibrant community of learners, healing together through events, workshops,
            wellness radio, and live sessions with experts.
          </p>
        </div>

        {/* Event type cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {eventTypes.map(({ icon: Icon, title, description, color, count }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-slate-100 card-hover"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">{description}</p>
              <span className="badge bg-slate-100 text-slate-500 text-xs">{count}</span>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-brand-purple" />
              Upcoming Events
            </h3>
            <Link
              href="/events"
              className="text-sm text-brand-purple font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="text-brand-purple font-bold text-lg leading-none">
                    {event.date.split(" ")[0]}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {event.date.split(" ")[1].slice(0, 3)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                    {event.free && (
                      <span className="badge bg-brand-teal-pale text-brand-teal text-xs">Free</span>
                    )}
                    <span className="badge bg-slate-100 text-slate-500 text-xs">{event.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {event.mode}
                    </span>
                    <span>{event.host}</span>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="flex-shrink-0 text-xs font-medium text-brand-purple border border-brand-purple/30 px-3 py-1.5 rounded-lg hover:bg-brand-purple-pale transition-colors"
                >
                  Register
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
