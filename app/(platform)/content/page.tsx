"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { BookOpen, Video, Headphones, Play, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  body?: string | null;
  mediaUrl?: string | null;
  thumbnail?: string | null;
  duration?: number | null;
  category?: string | null;
  tags: string[];
  authorId?: string | null;
  views: number;
  publishedAt?: string | null;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  BLOG: { icon: BookOpen, label: "Blog", color: "bg-brand-purple-pale text-brand-purple" },
  VIDEO: { icon: Video, label: "Video", color: "bg-orange-50 text-orange-600" },
  AUDIO: { icon: Headphones, label: "Audio", color: "bg-brand-teal-pale text-brand-teal" },
  PODCAST: { icon: Headphones, label: "Podcast", color: "bg-blue-50 text-blue-600" },
};

const TABS = ["All", "Blog", "Video", "Audio", "Podcast"] as const;

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");

  useEffect(() => {
    const type = activeTab === "All" ? "" : activeTab.toUpperCase();
    fetch(`/api/content${type ? `?type=${type}` : ""}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const featured = content[0];

  return (
    <>
      <TopBar pageTitle="Learning Hub" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setLoading(true); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-brand-purple text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-purple/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <div className="bg-gradient-to-br from-brand-purple to-indigo-700 rounded-3xl p-6 md:p-8 text-white">
            <span className="badge bg-white/20 text-white text-xs mb-3">Featured</span>
            <h2 className="font-display text-2xl font-bold mb-2">{featured.title}</h2>
            {featured.body && (
              <p className="text-white/70 text-sm max-w-lg mb-5 line-clamp-2">
                {featured.body.replace(/<[^>]+>/g, "").slice(0, 160)}...
              </p>
            )}
            <Link href={`/content/${featured.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-purple text-sm font-semibold hover:bg-brand-purple-pale transition-colors">
              Read Article <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Content grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 animate-pulse h-64" />
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No content available yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.map((item) => {
              const cfg = typeConfig[item.type] || typeConfig.BLOG;
              const Icon = cfg.icon;
              const isMedia = item.type !== "BLOG";
              return (
                <Link key={item.id} href={`/content/${item.id}`} className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover block">
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon size={32} className="text-slate-400" />
                    )}
                    {isMedia && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
                          <Play size={18} className="text-slate-700 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                      {item.category && (
                        <span className="badge bg-slate-100 text-slate-500 text-xs">{item.category}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span>{item.views} views</span>
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {Math.round(item.duration / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
