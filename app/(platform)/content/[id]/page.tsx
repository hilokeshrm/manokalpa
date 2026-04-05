"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/platform/TopBar";
import { BookOpen, Video, Headphones, Clock, ArrowLeft, Tag, Eye } from "lucide-react";

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
  views: number;
  publishedAt?: string | null;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  BLOG:    { icon: BookOpen,   label: "Blog",    color: "bg-brand-purple-pale text-brand-purple" },
  VIDEO:   { icon: Video,      label: "Video",   color: "bg-orange-50 text-orange-600" },
  AUDIO:   { icon: Headphones, label: "Audio",   color: "bg-brand-teal-pale text-brand-teal" },
  PODCAST: { icon: Headphones, label: "Podcast", color: "bg-blue-50 text-blue-600" },
};

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/content/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((data) => { if (data) setContent(data.content); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar pageTitle="Loading..." />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 animate-pulse h-96" />
        </div>
      </>
    );
  }

  if (notFound || !content) {
    return (
      <>
        <TopBar pageTitle="Not Found" />
        <div className="p-6 max-w-3xl mx-auto text-center">
          <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-4">Content not found or unpublished.</p>
          <button onClick={() => router.back()} className="btn-secondary gap-2">
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </>
    );
  }

  const cfg = typeConfig[content.type] || typeConfig.BLOG;
  const Icon = cfg.icon;
  const isMedia = content.type !== "BLOG";

  return (
    <>
      <TopBar pageTitle={content.title} />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-brand-purple transition-colors">
          <ArrowLeft size={14} /> Back to Learning Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Cover / media */}
          {content.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.thumbnail} alt={content.title} className="w-full h-56 object-cover" />
          ) : (
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Icon size={40} className="text-slate-300" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
              {content.category && (
                <span className="badge bg-slate-100 text-slate-500 text-xs">{content.category}</span>
              )}
              {content.duration && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {Math.round(content.duration / 60)} min
                </span>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                <Eye size={11} /> {content.views} views
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">{content.title}</h1>

            {content.publishedAt && (
              <p className="text-slate-400 text-xs mb-4">
                Published {new Date(content.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}

            {content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {content.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">
                    <Tag size={9} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Media player */}
        {isMedia && content.mediaUrl && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 text-sm">
              {content.type === "VIDEO" ? "Watch" : "Listen"}
            </h2>
            {content.type === "VIDEO" ? (
              <video
                src={content.mediaUrl}
                controls
                className="w-full rounded-xl bg-black"
              />
            ) : (
              <audio src={content.mediaUrl} controls className="w-full" />
            )}
          </div>
        )}

        {/* Body */}
        {content.body && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {content.body}
            </div>
          </div>
        )}

        {!content.body && !content.mediaUrl && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Icon size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Media content coming soon.</p>
          </div>
        )}
      </div>
    </>
  );
}
